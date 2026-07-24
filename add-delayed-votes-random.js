require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");

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
const totalVoters = countArg ? parseInt(countArg, 10) : 5;

// Nominees configuration (with "random" placeholder where requested)
const NOMINEES_CONFIG = {
  "best-actor-music": "random",             // Random nominee
  "best-actress-music": "n3",               // Lakita
  "best-singer-male": "n5",                 // Pratham Kumbhar
  "best-singer-female": "n2",               // Kiran Dash
  "best-director": "n1",                     // Chinmaya Kumar Sahu
  "best-choreographer": "n5",               // Karan
  "best-dop": "n5",                         // Sujit Sahoo
  "best-music": "n4",                       // DJ Udaya Sahu
  "best-actor/actress-in-comedy": "random"  // Random nominee
};

// Available nominees for randomized categories (n1 to n5)
const RANDOM_NOMINEES_LIST = ["n1", "n2", "n3", "n4", "n5"];

// Helper for realistic Indian names and phone numbers
function generateIndianVoter() {
  const firstNames = [
    "Rajesh", "Amit", "Priya", "Sunita", "Rohan", "Sneha", "Vikram", "Ananya", 
    "Suresh", "Deepak", "Pooja", "Neha", "Arjun", "Kavita", "Rahul", "Sanjay",
    "Manish", "Karan", "Aarav", "Aditya", "Riya", "Divya", "Swati", "Aisha",
    "Kunal", "Preeti", "Siddharth", "Simran", "Varun", "Shruti", "Gaurav", "Nisha"
  ];
  const lastNames = [
    "Kumar", "Patel", "Sharma", "Singh", "Devi", "Das", "Gupta", "Reddy", 
    "Joshi", "Verma", "Nair", "Rao", "Mehta", "Sen", "Bose", "Choudhury",
    "Mishra", "Pandey", "Yadav", "Trivedi", "Deshmukh", "Pillai", "Gill"
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

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log(`Database Target: ${dbType.toUpperCase()}`);
  console.log(`Total Voters to Add: ${totalVoters}`);
  console.log(`Delay Mode: ${isShortDelay ? "Short (1-3 seconds)" : "Real (1-3 minutes)"}`);
  console.log("Nominees Configuration:");
  console.table(NOMINEES_CONFIG);

  if (dbType === "sqlite") {
    await runSqlite();
  } else {
    await runPostgres();
  }
}

async function runSqlite() {
  const { DatabaseSync } = require("node:sqlite");
  const dbPath = path.join(process.cwd(), "test_votes.db");
  console.log(`Connecting to SQLite: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  for (let i = 0; i < totalVoters; i++) {
    const voter = generateIndianVoter();
    const voterId = crypto.randomUUID();

    // Resolve votes for this voter
    const resolvedVotes = {};
    for (const [catId, nomConfig] of Object.entries(NOMINEES_CONFIG)) {
      if (nomConfig === "random") {
        resolvedVotes[catId] = RANDOM_NOMINEES_LIST[Math.floor(Math.random() * RANDOM_NOMINEES_LIST.length)];
      } else {
        resolvedVotes[catId] = nomConfig;
      }
    }

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
      console.log(`[${new Date().toISOString()}] [Voter ${i + 1}/${totalVoters}] Cast votes for: ${voter.name} (${voter.contact})`);
      console.log(`  Votes:`, resolvedVotes);
    } catch (error) {
      db.exec("ROLLBACK");
      console.error(`Failed to cast votes for ${voter.name}:`, error);
    }

    if (i < totalVoters - 1) {
      // Calculate delay: 1-3 minutes (60k-180k ms) or 1-3 seconds (1k-3k ms)
      const minDelay = isShortDelay ? 1000 : 60000;
      const maxDelay = isShortDelay ? 3000 : 180000;
      const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
      console.log(`Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
      await sleep(delay);
    }
  }

  console.log("\n🎉 Done! All 5 voters successfully processed in SQLite test database.");
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

    // Resolve votes for this voter
    const resolvedVotes = {};
    for (const [catId, nomConfig] of Object.entries(NOMINEES_CONFIG)) {
      if (nomConfig === "random") {
        resolvedVotes[catId] = RANDOM_NOMINEES_LIST[Math.floor(Math.random() * RANDOM_NOMINEES_LIST.length)];
      } else {
        resolvedVotes[catId] = nomConfig;
      }
    }

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
      console.log(`[${new Date().toISOString()}] [Voter ${i + 1}/${totalVoters}] Cast votes for: ${voter.name} (${voter.contact})`);
      console.log(`  Votes:`, resolvedVotes);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Failed to cast votes for ${voter.name}:`, error);
    } finally {
      client.release();
    }

    if (i < totalVoters - 1) {
      const minDelay = isShortDelay ? 1000 : 60000;
      const maxDelay = isShortDelay ? 3000 : 180000;
      const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
      console.log(`Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
      await sleep(delay);
    }
  }

  await pool.end();
  console.log("\n🎉 Done! All 5 voters successfully processed in PostgreSQL production database.");
}

run().catch(console.error);
