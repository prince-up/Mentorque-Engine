import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query } from '../db.js';

export const profileRoutes = express.Router();

profileRoutes.use(authenticateToken);

// Get current user's profile
profileRoutes.get('/', async (req, res) => {
  try {
    const table = req.user.role === 'mentor' ? 'mentor_profiles' : 'user_profiles';
    const result = await query(`SELECT tags, description FROM ${table} WHERE user_id = $1`, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.json({ tags: [], description: '' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update current user's profile (Note: mentors shouldn't update their own profile based on the brief, but we can allow users to do so)
profileRoutes.put('/', async (req, res) => {
  try {
    const { tags, description } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    if (req.user.role === 'mentor') {
      return res.status(403).json({ error: 'Mentors metadata is managed by Admin' });
    }

    await query(`
      INSERT INTO user_profiles (user_id, tags, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET tags = $2, description = $3
    `, [req.user.id, JSON.stringify(tags), description || '']);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
