import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../db.js';

export const availabilityRoutes = express.Router();

availabilityRoutes.use(authenticateToken);

function getDatesForWeek(startDateStr) {
  const dates = [];
  const start = new Date(startDateStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

availabilityRoutes.get('/weekly', async (req, res) => {
  try {
    const { userId, mentorId } = req.query;
    const targetId = userId || mentorId || req.user.id;
    
    const result = await query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE owner_id = $1',
      [targetId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

availabilityRoutes.post('/batch', async (req, res) => {
  try {
    const { slots } = req.body;
    
    await query('BEGIN');
    await query('DELETE FROM availability WHERE owner_id = $1', [req.user.id]);
    
    if (slots && slots.length > 0) {
      for (const slot of slots) {
        // slot has { day_of_week, start_time, end_time } based on our frontend
        let st = slot.start_time;
        let et = slot.end_time;
        // ensure format HH:MM:SS
        if (st.length === 5) st = st + ':00';
        if (et.length === 5) et = et + ':00';
        
        await query(
          'INSERT INTO availability (owner_id, owner_role, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [req.user.id, req.user.role, slot.day_of_week, st, et]
        );
      }
    }
    await query('COMMIT');

    const result = await query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE owner_id = $1',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    await query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
