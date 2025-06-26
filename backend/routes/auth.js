const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users } = require('../data/users');
const { authMiddleware } = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 