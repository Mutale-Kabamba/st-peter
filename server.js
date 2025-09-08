
const express = require('express');
const path = require('path');
const fs = require('fs');
const basicAuth = require('basic-auth');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials (use environment variables in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'parish2024';

// Configure multer for file uploads
const upload = multer({ dest: 'assets/bulletins/' });

// Basic Auth middleware for admin routes
function adminAuth(req, res, next) {
  const user = basicAuth(req);
  if (!user || user.name !== ADMIN_USERNAME || user.pass !== ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).send('Access denied');
  }
  next();
}

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// ==== ADMIN ROUTES (Protected) ====

// Admin Dashboard
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Get list of available datasets
app.get('/admin/api/datasets', adminAuth, (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to list datasets.' });
    const datasets = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    res.json(datasets);
  });
});

// Get specific dataset
app.get('/admin/api/data/:dataset', adminAuth, (req, res) => {
  const dataFile = path.join(__dirname, 'data', `${req.params.dataset}.json`);
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Dataset not found.' });
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      res.status(500).json({ error: 'Invalid JSON format.' });
    }
  });
});

// Update specific dataset
app.put('/admin/api/data/:dataset', adminAuth, (req, res) => {
  const dataFile = path.join(__dirname, 'data', `${req.params.dataset}.json`);
  try {
    const jsonData = JSON.stringify(req.body, null, 2);
    fs.writeFile(dataFile, jsonData, 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save dataset.' });
      res.json({ success: true, message: 'Dataset updated successfully.' });
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON data.' });
  }
});

// Admin bulletin management
app.get('/admin/api/bulletins', adminAuth, (req, res) => {
  const dir = path.join(__dirname, 'assets', 'bulletins');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to list bulletins.' });
    const bulletins = files.filter(f => f.endsWith('.pdf')).map(f => ({
      name: f,
      url: `/assets/bulletins/${f}`,
      size: fs.statSync(path.join(dir, f)).size
    }));
    res.json(bulletins);
  });
});

// Delete bulletin
app.delete('/admin/api/bulletins/:filename', adminAuth, (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'bulletins', req.params.filename);
  if (!req.params.filename.endsWith('.pdf')) {
    return res.status(400).json({ error: 'Only PDF files can be deleted.' });
  }
  fs.unlink(filePath, (err) => {
    if (err) return res.status(404).json({ error: 'Bulletin not found.' });
    res.json({ success: true, message: 'Bulletin deleted successfully.' });
  });
});

// Upload new bulletin
app.post('/admin/api/bulletins', adminAuth, upload.single('bulletin'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  // Rename file to have proper PDF extension and move to correct location
  const originalName = req.body.filename || req.file.originalname;
  const newPath = path.join(__dirname, 'assets', 'bulletins', originalName);
  
  fs.rename(req.file.path, newPath, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save bulletin.' });
    res.json({ 
      success: true, 
      message: 'Bulletin uploaded successfully.',
      filename: originalName,
      url: `/assets/bulletins/${originalName}`
    });
  });
});

// ==== PUBLIC ROUTES (Existing - Unchanged) ====

// API endpoint to list all bulletin PDFs
app.get('/api/bulletins', (req, res) => {
  const dir = path.join(__dirname, 'assets', 'bulletins');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to list bulletins.' });
    const pdfs = files.filter(f => f.endsWith('.pdf')).map(f => ({
      name: f,
      url: `/assets/bulletins/${f}`
    }));
    res.json(pdfs);
  });
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

// Mass Times page
app.get('/mass-times', (req, res) => {
  res.sendFile(path.join(__dirname, 'mass-times.html'));
});

// Ministries page
app.get('/ministries', (req, res) => {
  res.sendFile(path.join(__dirname, 'ministries.html'));
});

// Route for contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Bulletin page
app.get('/bulletin', (req, res) => {
  res.sendFile(path.join(__dirname, 'bulletin.html'));
});

// Youth page
app.get('/youth', (req, res) => {
  res.sendFile(path.join(__dirname, 'youth.html'));
});

// Default route renders index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Live server running at http://localhost:${PORT}`);
});
