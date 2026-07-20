import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../db.js';
import { recommendMentors } from '../services/recommender.js';

export const callRequestsRoutes = express.Router();

callRequestsRoutes.use(authenticateToken);

// User: Submit a call request
callRequestsRoutes.post('/', requireRole(['user']), async (req, res) => {
  const { call_type, description } = req.body;
  try {
    const result = await query(
      'INSERT INTO call_requests (user_id, call_type, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, call_type, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: List pending call requests
callRequestsRoutes.get('/pending', requireRole(['admin']), async (req, res) => {
  try {
    const result = await query(`
      SELECT cr.*, u.name as user_name, u.email as user_email
      FROM call_requests cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get recommendations & overlap for a call request
callRequestsRoutes.get('/:id/recommendations', requireRole(['admin']), async (req, res) => {
  try {
    const requestId = req.params.id;
    const requestResult = await query('SELECT * FROM call_requests WHERE id = $1', [requestId]);
    const callRequest = requestResult.rows[0];
    if (!callRequest) return res.status(404).json({ error: 'Not found' });

    // 1. Get mentor recommendations
    const recommendations = await recommendMentors(callRequest);

    // 2. Compute overlap for each recommended mentor
    for (const rec of recommendations) {
      const overlapQuery = `
        SELECT u_avail.day_of_week, 
               GREATEST(u_avail.start_time, m_avail.start_time) as overlap_start,
               LEAST(u_avail.end_time, m_avail.end_time) as overlap_end
        FROM availability u_avail
        JOIN availability m_avail ON u_avail.day_of_week = m_avail.day_of_week
        WHERE u_avail.owner_id = $1 AND m_avail.owner_id = $2
          AND u_avail.start_time < m_avail.end_time 
          AND u_avail.end_time > m_avail.start_time
      `;
      const overlapResult = await query(overlapQuery, [callRequest.user_id, rec.id]);
      rec.overlaps = overlapResult.rows;
    }

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Book a call
callRequestsRoutes.post('/:id/book', requireRole(['admin']), async (req, res) => {
  const { mentor_id, scheduled_day, start_time, end_time } = req.body;
  try {
    await query('BEGIN');
    await query(
      'INSERT INTO bookings (call_request_id, mentor_id, admin_id, scheduled_day, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.params.id, mentor_id, req.user.id, scheduled_day, start_time, end_time]
    );
    await query('UPDATE call_requests SET status = $1 WHERE id = $2', ['booked', req.params.id]);
    await query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
