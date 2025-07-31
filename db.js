const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    // Create websites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        html_content TEXT NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    console.log("✅ Database and storage initialized");
  } catch (err) {
    console.error("❌ Initialization failed:", err);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initDB,
  query: (text, params) => pool.query(text, params)
};
