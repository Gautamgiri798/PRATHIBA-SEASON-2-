require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Not Loaded");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Neon!");
    console.log(result.rows);
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  } finally {
    await pool.end();
  }
})();