const express = require('express');

const app = express();
const PORT = 3000;

// Route 1: Root endpoint (Service Discovery / API Banner)
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

// Route 2: Health check endpoint (System Heartbeat Probe)
app.get('/health', (req, res) => {
  res.json({
    status: "ok"
  });
});

// Bind the web daemon to TCP port 3000
app.listen(PORT, () => {
  console.log(`Server is running and listening on http://localhost:${PORT}`);
});