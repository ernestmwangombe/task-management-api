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
    version: "3.0",
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
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  // Firewall / Validation Gate: Return 404 if record does not exist
  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  res.status(200).json(task);
});

// 3. POST /tasks - Create a new task record with payload validation
// Sysadmin Analogy: Service Intake Form Verification & Dynamic Primary Key Allocation
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Validation Gate / Input Firewall (Rule 1: Never trust incoming client data)
  // Rejects requests with missing, non-string, or blank titles with HTTP 400 Bad Request
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string" });
  }

  // Primary Key Allocation (DHCP Lease / Auto-Increment Analogy)
  // Calculates the next available free integer ID safely
  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

  // Construct official record object (Defaulting 'done' status to false)
  const newTask = {
    id: nextId,
    title: title.trim(),
    done: false
  };

  // Commit record to in-memory database cache
  tasks.push(newTask);

  // Return HTTP 201 Created ("Official receipt confirming record creation")
  res.status(201).json(newTask);
});

// Bind HTTP server daemon listener to TCP port 3000
app.listen(PORT, () => {
  console.log(`Task API Daemon running on http://localhost:${PORT}`);
});