const Database = require('better-sqlite3');
const path = require('path');

// 1. Mount / Connect to local SQLite database file on disk.
const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Enable Write-Ahead Logging (WAL) mode for crash safety and high read concurrency
db.pragma('journal_mode = WAL');

// 2. Initialize Tasks Table Schema
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  );
`;

db.exec(createTableQuery);

// 3. Idempotent Startup & Seeding Check
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const rowCount = countStmt.get().count;

if (rowCount === 0) {
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  
  // Wrap seed operations in a single atomic transaction
  const seedTransaction = db.transaction(() => {
    insertStmt.run('Responding to routine client emails', 0);
    insertStmt.run('Monitoring server status alerts', 0);
    insertStmt.run('Prepare for client meeting', 0);
  });

  seedTransaction();
  console.log('[DB] Tasks table initialized and seeded with 3 default records.');
} else {
  console.log(`[DB] Database connected successfully. Found ${rowCount} existing records.`);
}

module.exports = db;