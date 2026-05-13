const fs = require('fs');
const pool = require('./db');
const path = require('path');

async function init() {
  console.log("DB URL is:", process.env.DATABASE_URL);
  try {
    console.log("Reading schema.sql...");
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log("Executing schema.sql on Neon database...");
    await pool.query(schema);
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    pool.end();
  }
}

init();
