const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [
    { id: 1, title: "Responding to routine client emails", done: false },
    { id: 2, title: "Monitoring server status alerts", done: false },
    { id: 3, title: "Prepare for client meeting", done: false }
];

app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

app.post('/tasks', (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === "") {
        return res.status(400).json({ error: "Title is required and must be a non-empty string" });
    }
    const newTask = {
        id: tasks.length + 1,
        title,
        done: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: `Task ${taskId} not found` });
    res.status(200).json(task);
});

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: `Task ${taskId} not found` });

    const { title, done } = req.body;
    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = done;

    res.status(200).json(task);
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return res.status(404).json({ error: `Task ${taskId} not found` });

    tasks.splice(index, 1);
    res.status(204).send();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Task API Daemon running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});