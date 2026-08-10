require('dotenv').config();
const { Pool } = require('pg');

// Initialize Connection Pool
// Network Analogy: A bank of pre-warmed VPN tunnels kept open to handle incoming database traffic,
// avoiding the high CPU and latency overhead of opening a new TCP socket handshake per query.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initializes schema and seeds initial records idempotently.
 * Network Analogy: A system boot check verifying disk partition formatting 
 * before mounting local storage volumes.
 */
async function initDb() {
  // Acquire a single client socket from the connection pool
  const client = await pool.connect();
  try {
    // 1. Schema Provisioning Query
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT FALSE
      );
    `;
    await client.query(createTableQuery);

    // 2. Idempotency Check: Verify if table contains existing records
    const checkQuery = 'SELECT COUNT(*) FROM tasks;';
    const res = await client.query(checkQuery);
    const rowCount = parseInt(res.rows[0].count, 10);

    if (rowCount === 0) {
      // 3. Seed exact Week 2 default tasks
      const seedQuery = `
        INSERT INTO tasks (title, done) VALUES
        ('Responding to routine client emails', false),
        ('Monitoring server status alerts', false),
        ('Prepare for client meeting', false);
      `;
      await client.query(seedQuery);
      console.log('[SUCCESS] Schema created and 3 Week 2 example tasks seeded.');
    } else {
      console.log(`[SKIP] Database already contains ${rowCount} row(s). Seeding bypassed.`);
    }
  } catch (error) {
    console.error('[ERROR] Database initialization failed:', error.message);
    throw error;
  } finally {
    // Release client socket handle back to the pool to prevent socket exhaustion
    client.release();
  }
}

module.exports = {
  pool,
  initDb,
};