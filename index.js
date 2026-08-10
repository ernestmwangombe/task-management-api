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
 * POST /tasks
 * Creates a new task in PostgreSQL using parameterized query ($1, $2) and RETURNING *.
 * System Analogy: Registering a new host reservation in a DHCP server.
 * The RETURNING * clause acts like an immediate SYN-ACK acknowledgement, returning the auto-generated 
 * ID and default state directly to the client without requiring a secondary lookup query.
 */
app.post('/tasks', async (req, res) => {
  const { title, done = false } = req.body;

  // Input Sanitization: Validate missing or empty title string
  // Security Analogy: An ingress firewall rule dropping malformed packets missing mandatory header fields.
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    // Parameterized Query: $1 and $2 pass user payload values safely into PostgreSQL
    const queryText = 'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *;';
    const result = await pool.query(queryText, [title.trim(), Boolean(done)]);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to create task:', error.message);
    return res.status(500).json({ error: 'Internal server error while creating task.' });
  }
});

/**
 * PUT /tasks/:id
 * Updates an existing task record by primary key using parameterized placeholders ($1, $2, $3).
 * Security Analogy: Parameterized updates act like updating an ACL policy in-place on a firewall interface. 
 * Preserving the primary key ID ensures rule identity remains intact while updating parameters.
 */
app.put('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  // Input Sanitization: Validate numeric ID format
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID format. ID must be an integer.' });
  }

  const { title, done } = req.body;

  // Input Sanitization: Validate title requirement
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    // Parameterized Query: Prevents SQL injection by treating inputs strictly as data values
    const queryText = 'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *;';
    const result = await pool.query(queryText, [title.trim(), Boolean(done), taskId]);

    // Handle unknown IDs with 404 response
    // Network Analogy: Returning an ICMP Destination Unreachable response when targeting a non-existent endpoint.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to update task ID ${taskId}:`, error.message);
    return res.status(500).json({ error: 'Internal server error while updating task.' });
  }
});

/**
 * DELETE /tasks/:id
 * Deletes a task record by primary key using parameterized query ($1).
 * System Analogy: Unbinding a static NAT route or flushing a stale host entry from a network table.
 */
app.delete('/tasks/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  // Input Sanitization: Validate numeric ID format
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID format. ID must be an integer.' });
  }

  try {
    // Parameterized Query: Isolate taskId parameter from SQL execution
    const queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING *;';
    const result = await pool.query(queryText, [taskId]);

    // Handle unknown IDs with 404 response
    // Network Analogy: Returning an ICMP Destination Unreachable response when a host address is missing.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Successful deletion returns 204 No Content with an empty response body
    return res.status(204).send();
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to delete task ID ${taskId}:`, error.message);
    return res.status(500).json({ error: 'Internal server error while deleting task.' });
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
      console.log(`[ONLINE] Stage 3 API Gateway active on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[CRITICAL] Startup aborted due to database initialization failure:', error.message);
    process.exit(1);
  }
}

startServer();