
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
  res.render('about');
});

// Mass Times page
app.get('/mass-times', (req, res) => {
  res.render('mass-times');
});

// Ministries page
app.get('/ministries', (req, res) => {
  res.render('ministries');
});

// Route for contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Default route renders index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Live server running at http://localhost:${PORT}`);
});
