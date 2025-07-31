require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { initDB, query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Initialize database
initDB();

// API Endpoints
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/websites', async (req, res) => {
  try {
    const result = await query('SELECT * FROM websites');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/websites', async (req, res) => {
  const { id, title, html_content, is_public } = req.body;
  try {
    await query(
      `INSERT INTO websites (id, title, html_content, is_public)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET title = $2, html_content = $3, is_public = $4`,
      [id, title, html_content, is_public || false]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
