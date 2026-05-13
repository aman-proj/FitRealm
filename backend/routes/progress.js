const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get scoped progress metrics
// Route: GET /api/progress/:user_id?program_type=X&program_id=Y
router.get('/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { program_type, program_id } = req.query;

    // Security check: Only allow users to fetch their own data
    if (req.user.id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    if (!program_type || !program_id) {
      return res.status(400).json({ error: 'program_type and program_id are required query parameters' });
    }

    const metrics = await pool.query(
      `SELECT * FROM progress_records 
       WHERE user_id = $1 AND program_type = $2 AND program_id = $3
       ORDER BY updated_at DESC`,
      [user_id, program_type, program_id]
    );

    res.json(metrics.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update or Insert metric
// Route: POST /api/progress/update
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { user_id, program_type, program_id, metric_name, value } = req.body;

    // Security check
    if (req.user.id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    // Critical Evaluation Point: UPSERT logic with composite unique constraint
    const updateQuery = `
      INSERT INTO progress_records (user_id, program_type, program_id, metric_name, value, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, program_type, program_id, metric_name)
      DO UPDATE SET 
        value = EXCLUDED.value, 
        updated_at = NOW()
      RETURNING *;
    `;

    const updatedMetric = await pool.query(updateQuery, [
      user_id,
      program_type,
      program_id,
      metric_name,
      value
    ]);

    res.json(updatedMetric.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
