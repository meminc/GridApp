const express = require('express');
const router = express.Router();
const { scenarios, getNextScenarioId } = require('../data/scenarios');
const { authMiddleware } = require('../middleware/auth');

// Get all scenarios
router.get('/', (req, res) => {
  res.json(scenarios);
});

// Get scenario by ID
router.get('/:id', (req, res) => {
  const scenario = scenarios.find(s => s.id === Number(req.params.id));
  if (!scenario) return res.status(404).json({ error: 'Not found' });
  res.json(scenario);
});

// Create scenario (protected)
router.post('/', authMiddleware, (req, res) => {
  const { name, status, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const scenario = { id: getNextScenarioId(), name, status: status || 'Idle', description: description || '' };
  scenarios.push(scenario);
  res.status(201).json(scenario);
});

// Update scenario (protected)
router.put('/:id', authMiddleware, (req, res) => {
  const scenario = scenarios.find(s => s.id === Number(req.params.id));
  if (!scenario) return res.status(404).json({ error: 'Not found' });
  const { name, status, description } = req.body;
  if (name) scenario.name = name;
  if (status) scenario.status = status;
  if (description) scenario.description = description;
  res.json(scenario);
});

// Delete scenario (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = scenarios.findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [deleted] = scenarios.splice(idx, 1);
  res.json(deleted);
});

module.exports = router; 