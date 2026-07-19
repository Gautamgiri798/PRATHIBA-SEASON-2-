import { Pool, PoolClient } from "pg";

// Global pool caching for Next.js hot reload in development
declare global {
  var postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgrespassword@localhost:5432/pratibha_db";

export const pool =
  globalThis.postgresPool ??
  new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" && !connectionString.includes("localhost") && !connectionString.includes("postgres:5432")
      ? { rejectUnauthorized: false }
      : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresPool = pool;
}

// Track DB initialization
let isInitialized = false;

export async function initDb(): Promise<void> {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'Anonymous',
        contact TEXT NOT NULL UNIQUE,
        contact_type TEXT NOT NULL CHECK (contact_type IN ('mobile', 'email')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        voter_id TEXT NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
        category_id TEXT NOT NULL,
        nominee_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (voter_id, category_id)
      );

      CREATE INDEX IF NOT EXISTS votes_category_nominee_idx 
        ON votes (category_id, nominee_id);

      CREATE OR REPLACE VIEW vote_tallies AS
      SELECT category_id, nominee_id, count(*)::int AS votes
      FROM votes
      GROUP BY category_id, nominee_id
      ORDER BY category_id, votes DESC;

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      INSERT INTO settings (key, value) VALUES ('voting_active', 'true') ON CONFLICT (key) DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('voting_ends_at', '') ON CONFLICT (key) DO NOTHING;
    `);
    isInitialized = true;
  } catch (e) {
    console.error("PostgreSQL DB initialization error:", e);
    throw e;
  } finally {
    client.release();
  }
}

export async function getSetting(key: string): Promise<string> {
  try {
    await initDb();
    const res = await pool.query("SELECT value FROM settings WHERE key = $1", [key]);
    return res.rows[0]?.value ?? "";
  } catch (e) {
    console.warn(`Failed to get setting ${key}:`, e);
    return "";
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    await initDb();
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [key, value]
    );
  } catch (e) {
    console.warn(`Failed to set setting ${key} to ${value}:`, e);
  }
}

export async function castVoteTransaction(
  name: string,
  contact: string,
  contactType: string,
  votes: Record<string, string>
): Promise<string> {
  await initDb();
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");

    const voterId = crypto.randomUUID();
    await client.query(
      "INSERT INTO voters (id, name, contact, contact_type) VALUES ($1, $2, $3, $4)",
      [voterId, name, contact, contactType]
    );

    for (const [categoryId, nomineeId] of Object.entries(votes)) {
      const voteId = crypto.randomUUID();
      await client.query(
        "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES ($1, $2, $3, $4)",
        [voteId, voterId, categoryId, nomineeId]
      );
    }

    await client.query("COMMIT");
    return voterId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getTotalVoters(): Promise<number> {
  await initDb();
  const res = await pool.query("SELECT count(*)::int as count FROM voters");
  return res.rows[0]?.count ?? 0;
}

export async function getTallies(): Promise<{ category_id: string; nominee_id: string; votes: number }[]> {
  await initDb();
  const res = await pool.query("SELECT category_id, nominee_id, votes FROM vote_tallies");
  return res.rows;
}

export async function getVotersList(): Promise<{ name: string; contact: string; contact_type: string; created_at: string }[]> {
  await initDb();
  const res = await pool.query(
    "SELECT name, contact, contact_type, created_at::text FROM voters ORDER BY created_at DESC"
  );
  return res.rows;
}
