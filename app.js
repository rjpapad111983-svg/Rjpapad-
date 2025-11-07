const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

// initialize users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    sponsor_id INTEGER,
    position TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: 'change-this-secret-please',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000 }
}));

// attach currentUser to templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/');
}

// Home -> login/register page
app.get('/', redirectIfAuthenticated, (req, res) => {
  res.render('login-register');
});

// Register POST (protected)
app.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { name, mobile, password, sponsor_id, position } = req.body;
    if (!name || !mobile || !password) return res.status(400).send('Missing fields');

    const exists = db.prepare('SELECT id FROM users WHERE mobile = ?').get(mobile);
    if (exists) return res.status(400).send('Mobile already registered');

    const password_hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (name, mobile, password_hash, sponsor_id, position) VALUES (?, ?, ?, ?, ?)')
      .run(name, mobile, password_hash, sponsor_id || null, position || null);

    // after successful register, redirect to home (login)
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Login POST: returns JSON to let client decide (redirect or show register)
app.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ ok: false, message: 'Missing' });

    const user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile);
    if (!user) {
      // not registered — client will fade to register form
      return res.json({ ok: false, notRegistered: true });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.json({ ok: false, message: 'Invalid credentials' });

    // set session
    req.session.user = { id: user.id, name: user.name, mobile: user.mobile };
    return res.json({ ok: true, redirect: '/dashboard' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// For testing: list users (dev)
app.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, mobile, sponsor_id, position FROM users ORDER BY id DESC').all();
  res.render('users', { users });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
