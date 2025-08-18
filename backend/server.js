import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import path from 'path';

const app = express();
// Diagnostic logging for static path and requests
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.join(__dirname, 'public');
console.log('Serving static files from:', staticPath);
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
});
app.use(cors());
app.use(bodyParser.json());

const SECRET = 'replace_this_with_a_secure_secret';
import { fileURLToPath } from 'url';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// SQLite DB setup
let db;
(async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  db = await open({
    filename: path.join(__dirname, 'youth.db'),
    driver: sqlite3.Database
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS youth_register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    position TEXT,
    scc TEXT,
    phone TEXT,
    dob TEXT,
    occupation TEXT,
    address TEXT,
    active INTEGER DEFAULT 1
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
})();

// Auth endpoints
// TEMPORARY: Add admin user endpoint
app.post('/api/add-admin', async (req, res) => {
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', 'admin', 'admin123');
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// CRUD endpoints
app.get('/api/youth', authenticateToken, async (req, res) => {
  const rows = await db.all('SELECT * FROM youth_register');
  res.json(rows);
});

app.post('/api/youth', authenticateToken, async (req, res) => {
  const { name, position, scc, phone, dob, occupation, address, active } = req.body;
  const result = await db.run(
    'INSERT INTO youth_register (name, position, scc, phone, dob, occupation, address, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    name, position, scc, phone, dob, occupation, address, active ?? 1
  );
  res.json({ id: result.lastID });
});

app.put('/api/youth/:id', authenticateToken, async (req, res) => {
  const { name, position, scc, phone, dob, occupation, address, active } = req.body;
  await db.run(
    'UPDATE youth_register SET name=?, position=?, scc=?, phone=?, dob=?, occupation=?, address=?, active=? WHERE id=?',
    name, position, scc, phone, dob, occupation, address, active, req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/youth/:id', authenticateToken, async (req, res) => {
  await db.run('DELETE FROM youth_register WHERE id=?', req.params.id);
  res.json({ success: true });
});

// Statistics endpoint
app.get('/api/youth/stats', authenticateToken, async (req, res) => {
  const activeCount = await db.get('SELECT COUNT(*) as count FROM youth_register WHERE active=1');
  const sccBreakdown = await db.all('SELECT scc, COUNT(*) as count FROM youth_register GROUP BY scc');
  res.json({ activeCount: activeCount.count, sccBreakdown });
});

// Simple admin dashboard (static files)
// Register static middleware before API routes
// Serve main parish site at root
app.use(express.static(path.join(__dirname, '..')));
// Serve admin dashboard at /admin
app.use('/admin', express.static(staticPath));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
