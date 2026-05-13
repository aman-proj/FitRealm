const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all programs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const programs = await pool.query('SELECT * FROM programs ORDER BY name ASC');
    res.json(programs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
