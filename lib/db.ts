import Database from "better-sqlite3";
import path from "path";

declare global {
  var sqliteDb: Database.Database | undefined;
}

const dbPath = path.resolve(process.cwd(), "votes.db");

// Cache the database connection globally in development to prevent hot reloading 
// from creating multiple connections.
export const db = globalThis.sqliteDb ?? new Database(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalThis.sqliteDb = db;
}

// Enable foreign key support in SQLite (disabled by default)
db.pragma("foreign_keys = ON");

// Run schema migration: Check if voters table is missing the 'name' column
try {
  const tableInfo = db.prepare("PRAGMA table_info(voters)").all() as { name: string }[];
  if (tableInfo.length > 0) {
    const hasNameColumn = tableInfo.some((col) => col.name === "name");
    if (!hasNameColumn) {
      db.exec("ALTER TABLE voters ADD COLUMN name TEXT NOT NULL DEFAULT 'Anonymous'");
    }
  }
} catch (e: any) {
  // Ignore errors where a parallel Next.js worker process has already added the column.
  if (!e.message?.includes("duplicate column name")) {
    console.warn("Migration check error:", e);
  }
}

// Create schema automatically on startup
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

  CREATE INDEX IF NOT EXISTS votes_category_nominee_idx 
    ON votes (category_id, nominee_id);

  CREATE VIEW IF NOT EXISTS vote_tallies AS
  SELECT category_id, nominee_id, count(*) AS votes
  FROM votes
  GROUP BY category_id, nominee_id
  ORDER BY category_id, votes DESC;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed default settings if they do not exist
db.exec(`
  INSERT OR IGNORE INTO settings (key, value) VALUES ('voting_active', 'true');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('voting_ends_at', '');
`);

export function getSetting(key: string): string {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
    return row?.value ?? "";
  } catch (e) {
    console.warn(`Failed to get setting ${key}:`, e);
    return "";
  }
}

export function setSetting(key: string, value: string): void {
  try {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
  } catch (e) {
    console.warn(`Failed to set setting ${key} to ${value}:`, e);
  }
}

