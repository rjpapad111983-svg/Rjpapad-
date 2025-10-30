// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'rjpapad.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error('DB error:', err.message);
  console.log('Connected to DB');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    mobile TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post('/api/register', (req, res) => {
  const { name, mobile } = req.body || {};
  if (!mobile) return res.status(400).json({ success: false, error: 'Mobile required' });

  db.get('SELECT * FROM users WHERE mobile = ?', [mobile], (err, row) => {
    if (row) {
      db.get('SELECT * FROM wallets WHERE user_id = ?', [row.id], (werr, wallet) => {
        return res.json({ success: true, message: 'User exists', user: row, wallet });
      });
    } else {
      db.run('INSERT INTO users (name, mobile) VALUES (?, ?)', [name, mobile], function() {
        const userId = this.lastID;
        db.run('INSERT INTO wallets (user_id) VALUES (?)', [userId], function() {
          res.json({ success: true, message: 'Registered', user: { id: userId, name, mobile }, wallet: { balance: 0 } });
        });
      });
    }
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
