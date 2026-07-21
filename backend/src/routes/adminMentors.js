import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { query } from '../db.js';
import { getExtractor } from '../services/recommender.js';

export const adminMentorsRoutes = express.Router();

adminMentorsRoutes.use(authenticateToken);
adminMentorsRoutes.use(requireRole(['admin']));

// Get all mentors and their profiles
adminMentorsRoutes.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.name, u.email, mp.tags, mp.description
      FROM users u
      LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'mentor'
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a mentor's profile (tags, description) and regenerate embeddings
adminMentorsRoutes.put('/:id/profile', async (req, res) => {
  const mentorId = req.params.id;
  const { tags, description } = req.body;
  
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }

  try {
    await query('BEGIN');

    // Update or insert into mentor_profiles
    await query(`
      INSERT INTO mentor_profiles (user_id, tags, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET tags = $2, description = $3
    `, [mentorId, JSON.stringify(tags), description || '']);

    // Generate new embedding
    const sourceText = tags.join(' ') + ' ' + (description || '');
    const extractor = await getExtractor();
    const output = await extractor(sourceText, { pooling: 'mean', normalize: true });
    const embeddingArray = Array.from(output.data);
    const embeddingStr = '[' + embeddingArray.join(',') + ']';

    // Update embeddings table
    await query(`
      INSERT INTO embeddings (owner_id, owner_role, vector, source_text)
      VALUES ($1, 'mentor', $2, $3)
      ON CONFLICT (owner_id) DO UPDATE SET vector = $2, source_text = $3
    `, [mentorId, embeddingStr, sourceText]);

    await query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
