import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../db.js';

export const bookingsRoutes = express.Router();

bookingsRoutes.use(authenticateToken);

bookingsRoutes.get('/', async (req, res) => {
  try {
    let whereClause = '';
    const params = [];

    if (req.user.role === 'user') {
      whereClause = 'WHERE u.id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'mentor') {
      whereClause = 'WHERE m.id = $1';
      params.push(req.user.id);
    }

    const sql = `
      SELECT b.id, b.scheduled_day, b.start_time, b.end_time, 
             cr.call_type, cr.description, 
             u.name as user_name, u.email as user_email,
             m.name as mentor_name, m.email as mentor_email
      FROM bookings b
      JOIN call_requests cr ON b.call_request_id = cr.id
      JOIN users u ON cr.user_id = u.id
      JOIN users m ON b.mentor_id = m.id
      ${whereClause}
      ORDER BY b.scheduled_day ASC, b.start_time ASC
    `;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
