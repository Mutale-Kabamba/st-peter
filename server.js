
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

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
