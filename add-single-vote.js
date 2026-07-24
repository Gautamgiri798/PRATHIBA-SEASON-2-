require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");

// Parse command line arguments
const isProd = process.argv.includes("--prod");
const dbType = isProd ? "postgres" : "sqlite";

// Helper to generate a realistic Indian name and phone number
function generateIndianVoter() {
  const firstNames = [
    "Rajesh", "Amit", "Priya", "Sunita", "Rohan", "Sneha", "Vikram", "Ananya", 
    "Suresh", "Deepak", "Pooja", "Neha", "Arjun", "Kavita", "Rahul", "Sanjay",
    "Manish", "Karan", "Aarav", "Aditya", "Riya", "Divya", "Swati", "Aisha"
  ];
  const lastNames = [
    "Kumar", "Patel", "Sharma", "Singh", "Devi", "Das", "Gupta", "Reddy", 
    "Joshi", "Verma", "Nair", "Rao", "Mehta", "Sen", "Bose", "Choudhury"
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

// Find named arguments
function getArgValue(argName) {
  const index = process.argv.indexOf(argName);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return null;
}

let name = getArgValue("--name");
let contact = getArgValue("--contact");
let contactType = getArgValue("--type");
const categoryId = getArgValue("--category") || "best-singer-female";
const nomineeId = getArgValue("--nominee") || "n2"; // Kiran Dash (default)

// If details not provided, generate realistic Indian details
if (!name || !contact || !contactType) {
  console.log("No custom voter info provided. Generating realistic Indian voter details...");
  const randomVoter = generateIndianVoter();
  name = randomVoter.name;
  contact = randomVoter.contact;
  contactType = randomVoter.contactType;
}

if (contactType !== "mobile" && contactType !== "email") {
  console.error("Error: --type must be either 'mobile' or 'email'.");
  process.exit(1);
}

console.log(`Database Target: ${dbType.toUpperCase()}`);
console.log(`Voter Details:`);
console.log(`  Name:         ${name}`);
console.log(`  Contact:      ${contact}`);
console.log(`  Type:         ${contactType}`);
console.log(`  Category ID:  ${categoryId}`);
console.log(`  Nominee ID:   ${nomineeId}`);

async function run() {
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

  // Check if voter already exists
  const existingVoter = db.prepare("SELECT id FROM voters WHERE contact = ?").get(contact);
  if (existingVoter) {
    console.error(`Error: A voter with contact '${contact}' already exists in SQLite database.`);
    process.exit(1);
  }

  const voterId = crypto.randomUUID();
  const voteId = crypto.randomUUID();

  db.exec("BEGIN TRANSACTION");
  try {
    const insertVoter = db.prepare(
      "INSERT INTO voters (id, name, contact, contact_type) VALUES (?, ?, ?, ?)"
    );
    const insertVote = db.prepare(
      "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES (?, ?, ?, ?)"
    );

    insertVoter.run(voterId, name, contact, contactType);
    insertVote.run(voteId, voterId, categoryId, nomineeId);

    db.exec("COMMIT");
    console.log(`\n🎉 Success: 1 vote successfully cast in SQLite test database.`);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Failed to insert vote:", error);
    throw error;
  }
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

  try {
    // Check if voter already exists
    const existingRes = await pool.query("SELECT id FROM voters WHERE contact = $1", [contact]);
    if (existingRes.rowCount > 0) {
      console.error(`Error: A voter with contact '${contact}' already exists in PostgreSQL database.`);
      await pool.end();
      process.exit(1);
    }

    const voterId = crypto.randomUUID();
    const voteId = crypto.randomUUID();

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      await client.query(
        "INSERT INTO voters (id, name, contact, contact_type) VALUES ($1, $2, $3, $4)",
        [voterId, name, contact, contactType]
      );
      await client.query(
        "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES ($1, $2, $3, $4)",
        [voteId, voterId, categoryId, nomineeId]
      );

      await client.query("COMMIT");
      console.log(`\n🎉 Success: 1 vote successfully cast in PostgreSQL production database.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to insert postgres vote:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Postgres error:", error);
  } finally {
    await pool.end();
  }
}

run().catch(console.error);
