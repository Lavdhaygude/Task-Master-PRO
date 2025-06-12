const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize with empty array if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// CRUD operations
app.get('/api/tasks', (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  tasks.push(req.body);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks));
  res.json(req.body);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  const index = tasks.findIndex(t => t.id == req.params.id);
  if (index !== -1) {
    tasks[index] = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks));
  }
  res.json(req.body);
});

app.delete('/api/tasks/:id', (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  tasks = tasks.filter(t => t.id != req.params.id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks));
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));