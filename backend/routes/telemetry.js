const express = require('express');
const router = express.Router();

// Mock telemetry data
const voltages = { 1: 0.98, 2: 0.91, 3: 1.04 };
const alarms = { 2: 'Critical' };
const powerFlow = { 1: 120, 2: 80 };

router.get('/', (req, res) => {
  res.json({ voltages, alarms, powerFlow });
});

module.exports = router; 