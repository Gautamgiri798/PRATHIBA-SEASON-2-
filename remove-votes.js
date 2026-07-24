require("dotenv").config({ path: ".env.local" });
const path = require("path");

const CATEGORY_ID = "best-singer-female";
const NOMINEE_ID = "n2"; // Kiran Dash

const isProd = process.argv.includes("--prod");
const dbType = isProd ? "postgres" : "sqlite";

console.log(`Database Target: ${dbType.toUpperCase()}`);

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

  // Count current votes
  const countStmt = db.prepare(`
    SELECT count(*) as count 
    FROM votes 
    WHERE category_id = ? AND nominee_id = ?
  `);
  console.log(`Before cleanup: Kiran Dash has ${countStmt.get(CATEGORY_ID, NOMINEE_ID).count} votes in test database.`);

  // Perform cleanup
  db.exec("BEGIN TRANSACTION");
  try {
    const deleteVotes = db.prepare(`
      DELETE FROM votes 
      WHERE voter_id IN (SELECT id FROM voters WHERE contact LIKE 'mock_voter_%')
    `);
    const deleteVoters = db.prepare(`
      DELETE FROM voters 
      WHERE contact LIKE 'mock_voter_%'
    `);

    const votesDeleted = deleteVotes.run().changes;
    const votersDeleted = deleteVoters.run().changes;

    db.exec("COMMIT");
    console.log(`Cleaned up ${votesDeleted} votes and ${votersDeleted} voters from SQLite.`);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Failed to clean SQLite votes:", error);
    throw error;
  }

  console.log(`After cleanup: Kiran Dash has ${countStmt.get(CATEGORY_ID, NOMINEE_ID).count} votes in test database.`);
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
    // Count current votes
    const countRes = await pool.query(
      "SELECT count(*)::int as count FROM votes WHERE category_id = $1 AND nominee_id = $2",
      [CATEGORY_ID, NOMINEE_ID]
    );
    console.log(`Before cleanup: Kiran Dash has ${countRes.rows[0].count} votes in production database.`);

    // Perform cleanup in a transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const deleteVotesRes = await client.query(`
        DELETE FROM votes 
        WHERE voter_id IN (SELECT id FROM voters WHERE contact LIKE 'mock_voter_%')
      `);
      const deleteVotersRes = await client.query(`
        DELETE FROM voters 
        WHERE contact LIKE 'mock_voter_%'
      `);

      await client.query("COMMIT");
      console.log(`Cleaned up ${deleteVotesRes.rowCount} votes and ${deleteVotersRes.rowCount} voters from Postgres.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to clean PostgreSQL votes:", error);
      throw error;
    } finally {
      client.release();
    }

    const finalCountRes = await pool.query(
      "SELECT count(*)::int as count FROM votes WHERE category_id = $1 AND nominee_id = $2",
      [CATEGORY_ID, NOMINEE_ID]
    );
    console.log(`After cleanup: Kiran Dash has ${finalCountRes.rows[0].count} votes in production database.`);
  } catch (error) {
    console.error("Postgres error:", error);
  } finally {
    await pool.end();
  }
}

run().catch(console.error);
