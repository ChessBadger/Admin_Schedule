const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

// In-memory store for JSON data
let jsonData = null;

// Simple admin credentials
const adminUsername = 'admin';
const adminPassword = 'password';

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUsername && password === adminPassword) {
    res.send({ success: true });
  } else {
    res.status(401).send({ success: false });
  }
});

// Handle JSON file upload
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    jsonData = JSON.parse(req.file.buffer.toString());
    res.send({ success: true, data: jsonData });
  } catch (error) {
    res.status(400).send({ success: false, message: 'Error parsing JSON file' });
  }
});

// Get JSON data
app.get('/data', (req, res) => {
  if (jsonData) {
    res.send({ success: true, data: jsonData });
  } else {
    res.status(404).send({ success: false, message: 'No data found' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
