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
    const { weekStart, userId, mentorId } = req.query;
    const targetId = userId || mentorId || req.user.id;
    
    // Fetch day_of_week schedule
    const result = await query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE owner_id = $1',
      [targetId]
    );

    const dates = weekStart ? getDatesForWeek(weekStart) : [];
    const availability = {};
    
    // Convert day_of_week rules to specific dates for the frontend calendar
    if (dates.length > 0) {
      dates.forEach((dateStr, i) => {
        availability[dateStr] = result.rows
          .filter(r => r.day_of_week === i)
          .map(r => ({
            startTime: `${dateStr}T${r.start_time}Z`,
            endTime: `${dateStr}T${r.end_time}Z`
          }));
      });
    }

    res.json({
      dates,
      availability,
      hasTemplate: true // Always true since we only use recurring weekly schedule now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

availabilityRoutes.post('/batch', async (req, res) => {
  try {
    const { pattern } = req.body; // { dayOfWeek, hour }
    // We only support 'template' scope now (recurring weekly)
    
    await query('BEGIN');
    await query('DELETE FROM availability WHERE owner_id = $1', [req.user.id]);
    
    if (pattern && pattern.length > 0) {
      for (const slot of pattern) {
        const start_time = `${slot.hour.toString().padStart(2, '0')}:00:00`;
        const end_time = `${(slot.hour + 1).toString().padStart(2, '0')}:00:00`;
        
        await query(
          'INSERT INTO availability (owner_id, owner_role, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [req.user.id, req.user.role, slot.dayOfWeek, start_time, end_time]
        );
      }
    }
    await query('COMMIT');

    // Return the updated weekly view just like GET /weekly
    const result = await query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE owner_id = $1',
      [req.user.id]
    );
    const dates = getDatesForWeek(req.body.weekStart || new Date().toISOString().split('T')[0]);
    const availability = {};
    dates.forEach((dateStr, i) => {
      availability[dateStr] = result.rows
        .filter(r => r.day_of_week === i)
        .map(r => ({
          startTime: `${dateStr}T${r.start_time}Z`,
          endTime: `${dateStr}T${r.end_time}Z`
        }));
    });

    res.json({ dates, availability, hasTemplate: true });
  } catch (error) {
    await query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
