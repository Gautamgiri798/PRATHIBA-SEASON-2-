require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");

const CATEGORY_ID = "best-singer-female";
const NOMINEE_ID = "n2"; // Kiran Dash
const TARGET_VOTES = 1100;

// Parse command line arguments
const isProd = process.argv.includes("--prod");
const dbType = isProd ? "postgres" : "sqlite";

console.log(`Database Target: ${dbType.toUpperCase()}`);

// Helper to generate unique mock voter details
function generateMockVoter(index) {
  const uuid = crypto.randomUUID();
  return {
    id: uuid,
    name: `Mock Voter ${index + 1}`,
    contact: `mock_voter_${uuid}@example.com`,
    contact_type: "email",
  };
}

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

  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS voters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Anonymous',
      contact TEXT NOT NULL UNIQUE,
      contact_type TEXT NOT NULL CHECK (contact_type IN ('mobile', 'email')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      voter_id TEXT NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL,
      nominee_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (voter_id, category_id)
    );
  `);

  // Query current count
  const countStmt = db.prepare(`
    SELECT count(*) as count 
    FROM votes 
    WHERE category_id = ? AND nominee_id = ?
  `);
  let currentCount = countStmt.get(CATEGORY_ID, NOMINEE_ID).count;
  console.log(`Current votes for Kiran Dash in test database: ${currentCount}`);

  // If 0, simulate seeding to 888 first
  if (currentCount === 0) {
    console.log(`Test database is empty. Step 1: Seeding 888 votes...`);
    insertSqliteVotes(db, 888);
    currentCount = countStmt.get(CATEGORY_ID, NOMINEE_ID).count;
    console.log(`Votes after seeding: ${currentCount}`);
  }

  // Step 2: Add additional votes to reach TARGET_VOTES
  const votesToAdd = TARGET_VOTES - currentCount;
  if (votesToAdd <= 0) {
    console.log(`Already at or above target of ${TARGET_VOTES} votes.`);
    return;
  }

  console.log(`Step 2: Adding ${votesToAdd} additional votes to reach ${TARGET_VOTES}...`);
  insertSqliteVotes(db, votesToAdd);

  const finalCount = countStmt.get(CATEGORY_ID, NOMINEE_ID).count;
  console.log(`\n🎉 Verification: Total votes for Kiran Dash in test database is now: ${finalCount}`);
}

function insertSqliteVotes(db, count) {
  db.exec("BEGIN TRANSACTION");
  try {
    const insertVoter = db.prepare(
      "INSERT INTO voters (id, name, contact, contact_type) VALUES (?, ?, ?, ?)"
    );
    const insertVote = db.prepare(
      "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES (?, ?, ?, ?)"
    );

    for (let i = 0; i < count; i++) {
      const voter = generateMockVoter(i);
      insertVoter.run(voter.id, voter.name, voter.contact, voter.contact_type);
      insertVote.run(crypto.randomUUID(), voter.id, CATEGORY_ID, NOMINEE_ID);
    }
    db.exec("COMMIT");
    console.log(`Successfully inserted ${count} votes.`);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Failed to insert votes:", error);
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
    // Query current count
    const countRes = await pool.query(
      "SELECT count(*)::int as count FROM votes WHERE category_id = $1 AND nominee_id = $2",
      [CATEGORY_ID, NOMINEE_ID]
    );
    let currentCount = countRes.rows[0].count;
    console.log(`Current votes for Kiran Dash in production database: ${currentCount}`);

    const votesToAdd = TARGET_VOTES - currentCount;
    if (votesToAdd <= 0) {
      console.log(`Already at or above target of ${TARGET_VOTES} votes.`);
      return;
    }

    console.log(`Adding ${votesToAdd} additional votes to reach ${TARGET_VOTES}...`);

    // Insert in batches of 100 to avoid query size limits
    const batchSize = 100;
    for (let i = 0; i < votesToAdd; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, votesToAdd - i);
      await insertPostgresBatch(pool, currentBatchSize, i);
    }

    const finalCountRes = await pool.query(
      "SELECT count(*)::int as count FROM votes WHERE category_id = $1 AND nominee_id = $2",
      [CATEGORY_ID, NOMINEE_ID]
    );
    const finalCount = finalCountRes.rows[0].count;
    console.log(`\n🎉 Verification: Total votes for Kiran Dash in production database is now: ${finalCount}`);
  } catch (error) {
    console.error("Postgres error:", error);
  } finally {
    await pool.end();
  }
}

async function insertPostgresBatch(pool, count, startIndex) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    for (let i = 0; i < count; i++) {
      const voter = generateMockVoter(startIndex + i);
      await client.query(
        "INSERT INTO voters (id, name, contact, contact_type) VALUES ($1, $2, $3, $4)",
        [voter.id, voter.name, voter.contact, voter.contact_type]
      );
      await client.query(
        "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES ($1, $2, $3, $4)",
        [crypto.randomUUID(), voter.id, CATEGORY_ID, NOMINEE_ID]
      );
    }

    await client.query("COMMIT");
    console.log(`Inserted batch of ${count} votes.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to insert postgres batch:", error);
    throw error;
  } finally {
    client.release();
  }
}

run().catch(console.error);
