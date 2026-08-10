require('dotenv').config();
const express = require('express');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
// System Analogy: An ingress packet inspector on a perimeter firewall that normalizes incoming payload formats.
app.use(express.json());

/**
 * GET /tasks
 * Fetches all records from the PostgreSQL database table.
 * System Analogy: An ARP table query returning every active node registered on the local network segment.
 */
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC;');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to fetch tasks:', error.message);
    return res.status(500).json({ error: 'Internal server error while fetching tasks.' });
  }
});

/**
 * GET /tasks/:id
 * Fetches a single task by primary key using a parameterized query ($1).
 * Security Analogy: Parameterization acts like an IPSec tunnel wrapper. Passing $1 separately isolates 
 * user-supplied network input from executable SQL control logic, neutralizing SQL injection 
 * attack vectors at the perimeter to maintain ODPC compliance.
 */
app.get('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  // Input Sanitization: Validate numeric ID format
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID format. ID must be an integer.' });
  }

  try {
    // Parameterized Query: The $1 placeholder forces PostgreSQL to treat taskId purely as data
    const queryText = 'SELECT * FROM tasks WHERE id = $1;';
    const result = await pool.query(queryText, [taskId]);

    // Handle unknown IDs with 404 response
    // Network Analogy: Returning an ICMP Destination Unreachable response when a host address is missing.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to fetch task ID ${taskId}:`, error.message);
    return res.status(500).json({ error: 'Internal server error while fetching task.' });
  }
});

/**
 * Bootstrap Server
 * Initializes relation schema before opening port listener to prevent race conditions.
 */
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[ONLINE] Stage 2 API Gateway active on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[CRITICAL] Startup aborted due to database initialization failure:', error.message);
    process.exit(1);
  }
}

startServer();