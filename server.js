const express = require('express');

const app = express();
const PORT = 3000;

// Deep Packet Inspection Middleware: Parses incoming application/json body payloads
app.use(express.json());

// In-memory Task Array (Volatile RAM Cache)
// Seeded with 3 sysadmin workflow tasks using schema: id (number), title (text), done (boolean)
let tasks = [
  { id: 1, title: 'Responding to routine client emails', done: false },
  { id: 2, title: 'Monitoring server status alerts', done: false },
  { id: 3, title: 'Prepare for client meeting', done: false }
];

// Root Endpoint - Service Identity Discovery Banner
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "2.0",
    endpoints: ["/tasks", "/health"]
  });
});

// Health Endpoint - Service Heartbeat Probe
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// 1. GET /tasks - Read entire task array
// Sysadmin Analogy: Querying the active Windows Services list (Get-Service)
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// 2. GET /tasks/:id - Read single task by Path Parameter ID
// Sysadmin Analogy: Searching Windows Event Viewer for a specific Record ID (Get-WinEvent -InstanceId)
app.get('/tasks/:id', (req, res) => {
  // Parse string path parameter from URL into integer
  const taskId = parseInt(req.params.id, 10);

  // Search in-memory array for matching primary key ID
  const task = tasks.find(t => t.id === taskId);

  // Firewall / Validation Gate: Return 404 if record does not exist
  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  // Return matching task record with 200 OK status
  res.status(200).json(task);
});

// Bind HTTP server daemon listener to TCP port 3000
app.listen(PORT, () => {
  console.log(`Task API Daemon running on http://localhost:${PORT}`);
});