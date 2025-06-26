const express = require('express');
const router = express.Router();
const { users, getNextUserId } = require('../data/users');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// List all users (protected)
router.get('/', authMiddleware, (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
});

// Get user by ID (protected)
router.get('/:id', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, username: user.username, role: user.role });
});

// Create user (admin only)
router.post('/', authMiddleware, requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  if (users.some(u => u.username === username)) return res.status(409).json({ error: 'Username exists' });
  const user = { id: getNextUserId(), username, password, role };
  users.push(user);
  res.status(201).json({ id: user.id, username: user.username, role: user.role });
});

// Update user (admin only)
router.put('/:id', authMiddleware, requireAdmin, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const { username, password, role } = req.body;
  if (username) user.username = username;
  if (password) user.password = password;
  if (role) user.role = role;
  res.json({ id: user.id, username: user.username, role: user.role });
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireAdmin, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [deleted] = users.splice(idx, 1);
  res.json({ id: deleted.id, username: deleted.username, role: deleted.role });
});

module.exports = router; 