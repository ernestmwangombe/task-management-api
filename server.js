const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const db = require('./database');

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// 1. GET /tasks - Retrieve all tasks from SQLite
app.get('/tasks', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, title, done FROM tasks');
        const rows = stmt.all();
        
        // Map integer 0/1 back to boolean for JSON API contract consistency
        const tasks = rows.map(task => ({
            id: task.id,
            title: task.title,
            done: Boolean(task.done)
        }));

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve tasks from database" });
    }
});

// 3. GET /tasks/:id - Lookup single task by Primary Key ID
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: "Task ID must be a valid integer" });
    }

    try {
        const stmt = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?');
        const task = stmt.get(taskId);

        if (!task) {
            return res.status(404).json({ error: `Task ${taskId} not found` });
        }

        res.status(200).json({
            id: task.id,
            title: task.title,
            done: Boolean(task.done)
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to query database for task" });
    }
});

// Swagger Interactive UI Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start Application Daemon
app.listen(PORT, () => {
    console.log(`Task API Daemon running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});