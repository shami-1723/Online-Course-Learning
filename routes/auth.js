const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    const safeRole = role === 'instructor' ? 'instructor' : 'student';
    const [exists] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'This email is already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hash, safeRole]
    );
    req.session.user = { user_id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: safeRole };
    res.status(201).json({ message: 'Registration successful.', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Check database connection.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [(email || '').trim().toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const u = rows[0];
    req.session.user = { user_id: u.user_id, name: u.name, email: u.email, role: u.role };
    res.json({ message: 'Login successful.', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Check database connection.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

router.get('/me', (req, res) => res.json({ user: req.session.user || null }));

module.exports = router;
