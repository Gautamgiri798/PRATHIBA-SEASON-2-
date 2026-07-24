require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const isProd = process.argv.includes("--prod");
const dbType = isProd ? "postgres" : "sqlite";
const isShortDelay = process.argv.includes("--short-delay");

// Parse count argument
function getArgValue(argName) {
  const index = process.argv.indexOf(argName);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return null;
}
const countArg = getArgValue("--count");
const totalVoters = countArg ? parseInt(countArg, 10) : 500;

// Excluded list configuration
// n2 is Jeet Suna in best-actor-music
const BEST_ACTOR_NOMINEES = ["n1", "n3", "n4", "n5"]; 
// n5 is Kalpita Singh in best-actress-music
const BEST_ACTRESS_NOMINEES = ["n1", "n2", "n3", "n4"];
// No exclusion for comedy
const COMEDY_NOMINEES = ["n1", "n2", "n3", "n4", "n5"];

// Nominees configuration (fixed mapping or dynamic keys)
const FIXED_NOMINEES = {
  "best-actress-music": "n3",               // Lakita (but wait, we also have random except Kalpita, which is resolved dynamically below)
  "best-singer-male": "n5",                 // Pratham Kumbhar
  "best-singer-female": "n2",               // Kiran Dash
  "best-director": "n1",                     // Chinmaya Kumar Sahu
  "best-choreographer": "n5",               // Karan
  "best-dop": "n5",                         // Sujit Sahoo
  "best-music": "n4",                       // DJ Udaya Sahu
};

// Helper for realistic Indian names and phone numbers
function generateIndianVoter() {
  const firstNames = [
    "Rajesh", "Amit", "Priya", "Sunita", "Rohan", "Sneha", "Vikram", "Ananya", 
    "Suresh", "Deepak", "Pooja", "Neha", "Arjun", "Kavita", "Rahul", "Sanjay",
    "Manish", "Karan", "Aarav", "Aditya", "Riya", "Divya", "Swati", "Aisha",
    "Kunal", "Preeti", "Siddharth", "Simran", "Varun", "Shruti", "Gaurav", "Nisha",
    "Alok", "Dev", "Jyoti", "Kiran", "Madhav", "Nitin", "Pranav", "Rekha", "Shila"
  ];
  const lastNames = [
    "Kumar", "Patel", "Sharma", "Singh", "Devi", "Das", "Gupta", "Reddy", 
    "Joshi", "Verma", "Nair", "Rao", "Mehta", "Sen", "Bose", "Choudhury",
    "Mishra", "Pandey", "Yadav", "Trivedi", "Deshmukh", "Pillai", "Gill",
    "Prasad", "Dubey", "Shukla", "Saxena", "Malhotra", "Kulkarni", "Bhatt"
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;

  // Generate a realistic Indian mobile number (starts with 6, 7, 8, or 9 and has 10 digits)
  const prefix = ["6", "7", "8", "9"][Math.floor(Math.random() * 4)];
  let number = prefix;
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10);
  }

  return {
    name: fullName,
    contact: number,
    contactType: "mobile"
  };
}

// Log message helper
function logMessage(msg) {
  const formattedMsg = `[${new Date().toISOString()}] ${msg}`;
  console.log(formattedMsg);
  try {
    fs.appendFileSync(path.join(process.cwd(), "votes_run.log"), formattedMsg + "\n");
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  logMessage(`=== Starting Vote Casting ===`);
  logMessage(`Database Target: ${dbType.toUpperCase()}`);
  logMessage(`Total Voters to Add: ${totalVoters}`);
  logMessage(`Delay Mode: ${isShortDelay ? "Short (1-3 seconds)" : "Real (40-120 seconds)"}`);

  if (dbType === "sqlite") {
    await runSqlite();
  } else {
    await runPostgres();
  }
}

async function runSqlite() {
  const { DatabaseSync } = require("node:sqlite");
  const dbPath = path.join(process.cwd(), "test_votes.db");
  logMessage(`Connecting to SQLite: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  for (let i = 0; i < totalVoters; i++) {
    const voter = generateIndianVoter();
    const voterId = crypto.randomUUID();

    // Resolve votes dynamically based on rules
    const resolvedVotes = {
      "best-actor-music": BEST_ACTOR_NOMINEES[Math.floor(Math.random() * BEST_ACTOR_NOMINEES.length)],
      "best-actress-music": BEST_ACTRESS_NOMINEES[Math.floor(Math.random() * BEST_ACTRESS_NOMINEES.length)],
      "best-singer-male": FIXED_NOMINEES["best-singer-male"],
      "best-singer-female": FIXED_NOMINEES["best-singer-female"],
      "best-director": FIXED_NOMINEES["best-director"],
      "best-choreographer": FIXED_NOMINEES["best-choreographer"],
      "best-dop": FIXED_NOMINEES["best-dop"],
      "best-music": FIXED_NOMINEES["best-music"],
      "best-actor/actress-in-comedy": COMEDY_NOMINEES[Math.floor(Math.random() * COMEDY_NOMINEES.length)]
    };

    db.exec("BEGIN TRANSACTION");
    try {
      const insertVoter = db.prepare(
        "INSERT INTO voters (id, name, contact, contact_type) VALUES (?, ?, ?, ?)"
      );
      const insertVote = db.prepare(
        "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES (?, ?, ?, ?)"
      );

      insertVoter.run(voterId, voter.name, voter.contact, voter.contactType);
      for (const [catId, nomId] of Object.entries(resolvedVotes)) {
        insertVote.run(crypto.randomUUID(), voterId, catId, nomId);
      }
      db.exec("COMMIT");
      logMessage(`[Voter ${i + 1}/${totalVoters}] Cast votes for: ${voter.name} (${voter.contact})`);
      logMessage(`  Votes: ${JSON.stringify(resolvedVotes)}`);
    } catch (error) {
      db.exec("ROLLBACK");
      logMessage(`Failed to cast votes for ${voter.name}: ${error.message}`);
    }

    if (i < totalVoters - 1) {
      const minDelay = isShortDelay ? 1000 : 40000;
      const maxDelay = isShortDelay ? 3000 : 120000;
      const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
      logMessage(`Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
      await sleep(delay);
    }
  }

  logMessage("🎉 Done! All voters successfully processed in SQLite test database.");
}

async function runPostgres() {
  const { Pool } = require("pg");
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not defined in .env.local");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  for (let i = 0; i < totalVoters; i++) {
    const voter = generateIndianVoter();
    const voterId = crypto.randomUUID();

    // Resolve votes dynamically based on rules
    const resolvedVotes = {
      "best-actor-music": BEST_ACTOR_NOMINEES[Math.floor(Math.random() * BEST_ACTOR_NOMINEES.length)],
      "best-actress-music": BEST_ACTRESS_NOMINEES[Math.floor(Math.random() * BEST_ACTRESS_NOMINEES.length)],
      "best-singer-male": FIXED_NOMINEES["best-singer-male"],
      "best-singer-female": FIXED_NOMINEES["best-singer-female"],
      "best-director": FIXED_NOMINEES["best-director"],
      "best-choreographer": FIXED_NOMINEES["best-choreographer"],
      "best-dop": FIXED_NOMINEES["best-dop"],
      "best-music": FIXED_NOMINEES["best-music"],
      "best-actor/actress-in-comedy": COMEDY_NOMINEES[Math.floor(Math.random() * COMEDY_NOMINEES.length)]
    };

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      await client.query(
        "INSERT INTO voters (id, name, contact, contact_type) VALUES ($1, $2, $3, $4)",
        [voterId, voter.name, voter.contact, voter.contactType]
      );

      for (const [catId, nomId] of Object.entries(resolvedVotes)) {
        await client.query(
          "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES ($1, $2, $3, $4)",
          [crypto.randomUUID(), voterId, catId, nomId]
        );
      }

      await client.query("COMMIT");
      logMessage(`[Voter ${i + 1}/${totalVoters}] Cast votes for: ${voter.name} (${voter.contact})`);
      logMessage(`  Votes: ${JSON.stringify(resolvedVotes)}`);
    } catch (error) {
      await client.query("ROLLBACK");
      logMessage(`Failed to cast votes for ${voter.name}: ${error.message}`);
    } finally {
      client.release();
    }

    if (i < totalVoters - 1) {
      const minDelay = isShortDelay ? 1000 : 40000;
      const maxDelay = isShortDelay ? 3000 : 120000;
      const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
      logMessage(`Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
      await sleep(delay);
    }
  }

  await pool.end();
  logMessage("🎉 Done! All voters successfully processed in PostgreSQL production database.");
}

run().catch(console.error);
