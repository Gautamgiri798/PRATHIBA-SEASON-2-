require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");

const isProd = process.argv.includes("--prod");
const dbType = isProd ? "postgres" : "sqlite";

// Find named arguments
function getArgValue(argName) {
  const index = process.argv.indexOf(argName);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return null;
}

const contactFilter = getArgValue("--contact");

const CATEGORIES = [
  { id: "best-actor-music", defaultNominee: "n1" },
  { id: "best-actress-music", defaultNominee: "n1" },
  { id: "best-singer-male", defaultNominee: "n1" },
  { id: "best-director", defaultNominee: "n1" },
  { id: "best-choreographer", defaultNominee: "n1" },
  { id: "best-dop", defaultNominee: "n1" },
  { id: "best-music", defaultNominee: "n1" },
  { id: "best-actor/actress-in-comedy", defaultNominee: "n1" }
];

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

  let lastVoter;
  if (contactFilter) {
    lastVoter = db.prepare(`
      SELECT id, name, contact 
      FROM voters 
      WHERE contact = ?
    `).get(contactFilter);
  } else {
    lastVoter = db.prepare(`
      SELECT id, name, contact 
      FROM voters 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get();
  }

  if (!lastVoter) {
    console.error(`Error: Voter not found in SQLite database${contactFilter ? ` for contact '${contactFilter}'` : ""}.`);
    process.exit(1);
  }

  console.log(`Found voter: ${lastVoter.name} (Contact: ${lastVoter.contact}, ID: ${lastVoter.id})`);

  db.exec("BEGIN TRANSACTION");
  try {
    const checkVote = db.prepare(`
      SELECT count(*) as count 
      FROM votes 
      WHERE voter_id = ? AND category_id = ?
    `);
    const insertVote = db.prepare(`
      INSERT INTO votes (id, voter_id, category_id, nominee_id) 
      VALUES (?, ?, ?, ?)
    `);

    let votesAdded = 0;
    for (const cat of CATEGORIES) {
      const exists = checkVote.get(lastVoter.id, cat.id).count > 0;
      if (!exists) {
        insertVote.run(crypto.randomUUID(), lastVoter.id, cat.id, cat.defaultNominee);
        votesAdded++;
        console.log(`Added vote in category '${cat.id}' for nominee '${cat.defaultNominee}'`);
      } else {
        console.log(`Voter already voted in category '${cat.id}'`);
      }
    }

    db.exec("COMMIT");
    console.log(`\n🎉 Success: Added ${votesAdded} votes for voter ${lastVoter.name} in SQLite database.`);
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
    let lastVoterRes;
    if (contactFilter) {
      lastVoterRes = await pool.query(`
        SELECT id, name, contact 
        FROM voters 
        WHERE contact = $1
      `, [contactFilter]);
    } else {
      lastVoterRes = await pool.query(`
        SELECT id, name, contact 
        FROM voters 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
    }

    if (lastVoterRes.rowCount === 0) {
      console.error(`Error: Voter not found in PostgreSQL database${contactFilter ? ` for contact '${contactFilter}'` : ""}.`);
      await pool.end();
      process.exit(1);
    }

    const lastVoter = lastVoterRes.rows[0];
    console.log(`Found voter: ${lastVoter.name} (Contact: ${lastVoter.contact}, ID: ${lastVoter.id})`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      let votesAdded = 0;
      for (const cat of CATEGORIES) {
        const checkVoteRes = await client.query(`
          SELECT count(*)::int as count 
          FROM votes 
          WHERE voter_id = $1 AND category_id = $2
        `, [lastVoter.id, cat.id]);

        const exists = checkVoteRes.rows[0].count > 0;
        if (!exists) {
          await client.query(`
            INSERT INTO votes (id, voter_id, category_id, nominee_id) 
            VALUES ($1, $2, $3, $4)
          `, [crypto.randomUUID(), lastVoter.id, cat.id, cat.defaultNominee]);
          votesAdded++;
          console.log(`Added vote in category '${cat.id}' for nominee '${cat.defaultNominee}'`);
        } else {
          console.log(`Voter already voted in category '${cat.id}'`);
        }
      }

      await client.query("COMMIT");
      console.log(`\n🎉 Success: Added ${votesAdded} votes for voter ${lastVoter.name} in PostgreSQL database.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to insert postgres votes:", error);
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
