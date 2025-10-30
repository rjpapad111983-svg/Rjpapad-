// server.js (for Render deployment - simple wallet register system)

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// folders & data file
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wallets.json');

// create folder/file if not exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}', 'utf8');

// middleware
app.use(cors());
app.use(bodyParser.json());

// helper: read/write wallets
function readWallets() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
function writeWallets(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API: register user
app.post('/api/register', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ ok: false, error: 'phone required' });

  const wallets = readWallets();

  if (!wallets[phone]) {
    wallets[phone] = {
      id: uuidv4(),
      phone,
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    writeWallets(wallets);
    console.log('New user registered:', phone);
  }

  res.json({ ok: true, wallet: wallets[phone] });
});

// API: get wallet
app.get('/api/wallet/:phone', (req, res) => {
  const phone = req.params.phone;
  const wallets = readWallets();
  if (!wallets[phone]) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, wallet: wallets[phone] });
});

// simple health check
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'running' }));

// start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
