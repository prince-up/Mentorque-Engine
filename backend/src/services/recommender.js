import { pipeline } from '@xenova/transformers';
import { query } from '../db.js';

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function recommendMentors(callRequest) {
  const { call_type, description, user_id } = callRequest;
  
  // 1. Fetch user tags (just for any rule-based logic if needed)
  const userRes = await query('SELECT tags FROM user_profiles WHERE user_id = $1', [user_id]);
  const userTags = userRes.rows[0]?.tags || [];
  
  // 2. Embed user request description on the fly
  const ext = await getExtractor();
  const output = await ext(description || '', { pooling: 'mean', normalize: true });
  const embeddingArray = Array.from(output.data);
  const embeddingStr = '[' + embeddingArray.join(',') + ']';

  // 3. Query pgvector for base similarity ranking
  const mentorQuery = `
    SELECT u.id, u.name, mp.tags, mp.description,
           (e.vector <=> $1::vector) as distance
    FROM embeddings e
    JOIN users u ON e.owner_id = u.id
    JOIN mentor_profiles mp ON u.id = mp.user_id
    WHERE e.owner_role = 'mentor'
    ORDER BY distance ASC
    LIMIT 10
  `;
  const result = await query(mentorQuery, [embeddingStr]);
  let mentors = result.rows;

  // 4. Apply rule-based boosts
  mentors = mentors.map(m => {
    let score = 1.0 - m.distance; // convert cosine distance to similarity score
    const tags = m.tags || [];
    
    if (call_type === 'resume_revamp' && tags.includes('big_tech')) {
      score += 0.2;
    } else if (call_type === 'job_market_guidance' && tags.includes('good_communication')) {
      score += 0.2;
    } else if (call_type === 'mock_interview') {
      // boost if domain tag matches any user tag (simple intersection)
      const matches = tags.filter(t => userTags.includes(t));
      if (matches.length > 0) score += 0.2;
    }
    
    return { ...m, score };
  });

  // Sort by final score
  mentors.sort((a, b) => b.score - a.score);
  mentors = mentors.slice(0, 3);

  // Add simple explanation
  mentors.forEach(m => {
    if (call_type === 'resume_revamp' && m.tags.includes('big_tech')) {
      m.explanation = 'Strong match: Has Big Tech experience suitable for resume reviews.';
    } else if (call_type === 'job_market_guidance' && m.tags.includes('good_communication')) {
      m.explanation = 'Strong match: Excellent communicator for market guidance.';
    } else if (call_type === 'mock_interview') {
      m.explanation = 'Strong match: Domain alignment and relevant expertise.';
    } else {
      m.explanation = 'Good match based on your description and their profile.';
    }
  });

  return mentors;
}
