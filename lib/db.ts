import { Pool, PoolClient } from "pg";

// Global pool caching for Next.js hot reload in development
declare global {
  var postgresPool: Pool | undefined;
  var postgresTestPool: Pool | undefined;
  var dbMode: "postgres" | "sqlite" | undefined;
  var dbTestMode: "postgres" | "sqlite" | undefined;
  var sqliteDb: any | undefined;
  var sqliteTestDb: any | undefined;
}

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgrespassword@localhost:5432/pratibha_db";

const testConnectionString =
  process.env.TEST_DATABASE_URL || "";

export const pool =
  globalThis.postgresPool ??
  new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production" &&
      !connectionString.includes("localhost") &&
      !connectionString.includes("postgres:5432")
        ? { rejectUnauthorized: false }
        : false,
    connectionTimeoutMillis: 3000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresPool = pool;
}

function getTestPool(): Pool | null {
  if (!testConnectionString) return null;
  if (!globalThis.postgresTestPool) {
    globalThis.postgresTestPool = new Pool({
      connectionString: testConnectionString,
      ssl:
        process.env.NODE_ENV === "production" &&
        !testConnectionString.includes("localhost") &&
        !testConnectionString.includes("postgres:5432")
          ? { rejectUnauthorized: false }
          : false,
      connectionTimeoutMillis: 3000,
    });
  }
  return globalThis.postgresTestPool;
}

let activeDriver: "postgres" | "sqlite" = globalThis.dbMode || "postgres";
let isInitialized = false;
let isTestInitialized = false;

function getSqliteDb(isTest = false) {
  if (isTest) {
    if (!globalThis.sqliteTestDb) {
      const path = require("path");
      const dbPath = path.join(process.cwd(), "test_votes.db");
      const { DatabaseSync } = require("node:sqlite");
      globalThis.sqliteTestDb = new DatabaseSync(dbPath);
    }
    return globalThis.sqliteTestDb;
  } else {
    if (!globalThis.sqliteDb) {
      const path = require("path");
      const dbPath = path.join(process.cwd(), "votes.db");
      const { DatabaseSync } = require("node:sqlite");
      globalThis.sqliteDb = new DatabaseSync(dbPath);
    }
    return globalThis.sqliteDb;
  }
}

function getDriver(isTest = false): "postgres" | "sqlite" {
  if (isTest) {
    return globalThis.dbTestMode || "sqlite";
  }
  return activeDriver;
}

function getPool(isTest = false): Pool {
  if (isTest) {
    return getTestPool() || pool;
  }
  return pool;
}

export async function initDb(isTest = false): Promise<void> {
  if (isTest) {
    if (isTestInitialized) return;

    // Try Postgres for test if a connection string is provided
    const testPool = getTestPool();
    if (testPool) {
      try {
        const client = await testPool.connect();
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
          globalThis.dbTestMode = "postgres";
          isTestInitialized = true;
          return;
        } finally {
          client.release();
        }
      } catch (pgError: any) {
        console.warn(
          `[DB] Test PostgreSQL connection failed (${pgError?.message || pgError?.code}). Falling back to local SQLite database (test_votes.db).`
        );
      }
    }

    // Fallback SQLite test database
    try {
      const sqlite = getSqliteDb(true);
      sqlite.exec(`
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

        CREATE INDEX IF NOT EXISTS votes_category_nominee_idx 
          ON votes (category_id, nominee_id);

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        INSERT INTO settings (key, value) VALUES ('voting_active', 'true') ON CONFLICT (key) DO NOTHING;
        INSERT INTO settings (key, value) VALUES ('voting_ends_at', '') ON CONFLICT (key) DO NOTHING;
      `);
      globalThis.dbTestMode = "sqlite";
      isTestInitialized = true;
    } catch (sqliteErr) {
      console.error("SQLite Test DB initialization error:", sqliteErr);
      throw sqliteErr;
    }
  } else {
    // Normal DB initialization
    if (isInitialized) return;

    try {
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
        activeDriver = "postgres";
        if (process.env.NODE_ENV !== "production") globalThis.dbMode = "postgres";
        isInitialized = true;
        return;
      } finally {
        client.release();
      }
    } catch (pgError: any) {
      console.warn(
        `[DB] PostgreSQL connection failed (${pgError?.message || pgError?.code}). Falling back to local SQLite database (votes.db).`
      );
      activeDriver = "sqlite";
      if (process.env.NODE_ENV !== "production") globalThis.dbMode = "sqlite";
    }

    try {
      const sqlite = getSqliteDb(false);
      sqlite.exec(`
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

        CREATE INDEX IF NOT EXISTS votes_category_nominee_idx 
          ON votes (category_id, nominee_id);

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        INSERT INTO settings (key, value) VALUES ('voting_active', 'true') ON CONFLICT (key) DO NOTHING;
        INSERT INTO settings (key, value) VALUES ('voting_ends_at', '') ON CONFLICT (key) DO NOTHING;
      `);
      isInitialized = true;
    } catch (sqliteErr) {
      console.error("SQLite DB initialization error:", sqliteErr);
      throw sqliteErr;
    }
  }
}

export async function getSetting(key: string, isTest = false): Promise<string> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      const res = await dbPool.query("SELECT value FROM settings WHERE key = $1", [key]);
      return res.rows[0]?.value ?? "";
    } else {
      const sqlite = getSqliteDb(isTest);
      const stmt = sqlite.prepare("SELECT value FROM settings WHERE key = ?");
      const row = stmt.get(key) as { value: string } | undefined;
      return row?.value ?? "";
    }
  } catch (e) {
    console.warn(`Failed to get setting ${key} (isTest=${isTest}):`, e);
    return "";
  }
}

export async function setSetting(key: string, value: string, isTest = false): Promise<void> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      await dbPool.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [key, value]
      );
    } else {
      const sqlite = getSqliteDb(isTest);
      const stmt = sqlite.prepare(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      );
      stmt.run(key, value);
    }
  } catch (e) {
    console.warn(`Failed to set setting ${key} to ${value} (isTest=${isTest}):`, e);
  }
}

export async function castVoteTransaction(
  name: string,
  contact: string,
  contactType: string,
  votes: Record<string, string>,
  isTest = false
): Promise<string> {
  await initDb(isTest);
  const voterId = crypto.randomUUID();
  const driver = getDriver(isTest);

  if (driver === "postgres") {
    const dbPool = getPool(isTest);
    const client: PoolClient = await dbPool.connect();
    try {
      await client.query("BEGIN");

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
  } else {
    const sqlite = getSqliteDb(isTest);
    try {
      sqlite.exec("BEGIN IMMEDIATE");

      const insertVoter = sqlite.prepare(
        "INSERT INTO voters (id, name, contact, contact_type) VALUES (?, ?, ?, ?)"
      );
      insertVoter.run(voterId, name, contact, contactType);

      const insertVote = sqlite.prepare(
        "INSERT INTO votes (id, voter_id, category_id, nominee_id) VALUES (?, ?, ?, ?)"
      );
      for (const [categoryId, nomineeId] of Object.entries(votes)) {
        const voteId = crypto.randomUUID();
        insertVote.run(voteId, voterId, categoryId, nomineeId);
      }

      sqlite.exec("COMMIT");
      return voterId;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }
}

export async function getTotalVoters(isTest = false): Promise<number> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      const res = await dbPool.query("SELECT count(*)::int as count FROM voters");
      return res.rows[0]?.count ?? 0;
    } else {
      const sqlite = getSqliteDb(isTest);
      const row = sqlite.prepare("SELECT count(*) as count FROM voters").get() as { count: number } | undefined;
      return Number(row?.count ?? 0);
    }
  } catch (e) {
    console.warn(`Failed to get total voters (isTest=${isTest}):`, e);
    return 0;
  }
}

export async function getTallies(isTest = false): Promise<{ category_id: string; nominee_id: string; votes: number }[]> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      const res = await dbPool.query("SELECT category_id, nominee_id, votes FROM vote_tallies");
      return res.rows;
    } else {
      const sqlite = getSqliteDb(isTest);
      const rows = sqlite.prepare(
        "SELECT category_id, nominee_id, count(*) as votes FROM votes GROUP BY category_id, nominee_id ORDER BY category_id, votes DESC"
      ).all() as { category_id: string; nominee_id: string; votes: number }[];
      return rows;
    }
  } catch (e) {
    console.warn(`Failed to get tallies (isTest=${isTest}):`, e);
    return [];
  }
}

export async function getVotersList(isTest = false): Promise<{ id: string; name: string; contact: string; contact_type: string; created_at: string }[]> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      const res = await dbPool.query(
        "SELECT id, name, contact, contact_type, created_at::text FROM voters ORDER BY created_at DESC"
      );
      return res.rows;
    } else {
      const sqlite = getSqliteDb(isTest);
      const rows = sqlite.prepare(
        "SELECT id, name, contact, contact_type, created_at as created_at FROM voters ORDER BY created_at DESC"
      ).all() as { id: string; name: string; contact: string; contact_type: string; created_at: string }[];
      return rows;
    }
  } catch (e) {
    console.warn(`Failed to get voters list (isTest=${isTest}):`, e);
    return [];
  }
}

export async function getAllVotes(isTest = false): Promise<{ voter_id: string; category_id: string; nominee_id: string }[]> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      const res = await dbPool.query("SELECT voter_id, category_id, nominee_id FROM votes");
      return res.rows;
    } else {
      const sqlite = getSqliteDb(isTest);
      const rows = sqlite.prepare("SELECT voter_id, category_id, nominee_id FROM votes").all() as { voter_id: string; category_id: string; nominee_id: string }[];
      return rows;
    }
  } catch (e) {
    console.warn(`Failed to get all votes (isTest=${isTest}):`, e);
    return [];
  }
}

export async function clearAllVotes(isTest = false): Promise<void> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      await dbPool.query("DELETE FROM votes; DELETE FROM voters;");
    } else {
      const sqlite = getSqliteDb(isTest);
      sqlite.exec("DELETE FROM votes; DELETE FROM voters;");
    }
  } catch (e) {
    console.error(`Failed to clear votes database (isTest=${isTest}):`, e);
    throw e;
  }
}

export async function deleteVoter(voterId: string, isTest = false): Promise<void> {
  try {
    await initDb(isTest);
    const driver = getDriver(isTest);
    if (driver === "postgres") {
      const dbPool = getPool(isTest);
      await dbPool.query("DELETE FROM votes WHERE voter_id = $1", [voterId]);
      await dbPool.query("DELETE FROM voters WHERE id = $1", [voterId]);
    } else {
      const sqlite = getSqliteDb(isTest);
      sqlite.prepare("DELETE FROM votes WHERE voter_id = ?").run(voterId);
      sqlite.prepare("DELETE FROM voters WHERE id = ?").run(voterId);
    }
  } catch (e) {
    console.error(`Failed to delete voter ${voterId} (isTest=${isTest}):`, e);
    throw e;
  }
}
