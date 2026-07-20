import bcrypt from 'bcryptjs';
import { pipeline } from '@xenova/transformers';
import { query } from '../src/db.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function seed() {
  try {
    console.log('Seeding started...');
    const saltRounds = 10;
    
    // Create admin
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    const adminRes = await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $3
      RETURNING id
    `, [ADMIN_NAME, ADMIN_EMAIL, adminHash]);
    console.log('Admin seeded.');

    // Pre-load Xenova pipeline
    console.log('Loading embedding model...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Users seed data
    const usersData = [
      { name: "Alice Smith", email: "alice@example.com", tags: ["tech", "frontend"], description: "Junior developer looking for guidance." },
      { name: "Bob Jones", email: "bob@example.com", tags: ["non-tech", "marketing"], description: "Marketing specialist transitioning to tech." },
      { name: "Charlie Brown", email: "charlie@example.com", tags: ["tech", "backend"], description: "Needs help with resume revamp." },
      { name: "Diana Prince", email: "diana@example.com", tags: ["good communication", "data"], description: "Asks a lot of questions about big tech." },
      { name: "Evan Wright", email: "evan@example.com", tags: ["tech", "fullstack"], description: "Looking for mock interviews." },
      { name: "Fiona Gallagher", email: "fiona@example.com", tags: ["non-tech", "product"], description: "Product manager seeking career advice." },
      { name: "George Miller", email: "george@example.com", tags: ["tech", "devops"], description: "Wants to understand job market." },
      { name: "Hannah Lee", email: "hannah@example.com", tags: ["good communication", "design"], description: "UX designer wanting to transition to product." },
      { name: "Ian Fleming", email: "ian@example.com", tags: ["tech", "security"], description: "Security analyst seeking mentorship." },
      { name: "Julia Roberts", email: "julia@example.com", tags: ["non-tech", "sales"], description: "Sales rep looking into tech roles." }
    ];

    console.log('Seeding users...');
    for (const u of usersData) {
      const hash = await bcrypt.hash('user123', saltRounds);
      const res = await query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, 'user')
        ON CONFLICT (email) DO UPDATE SET name = $1
        RETURNING id
      `, [u.name, u.email, hash]);
      const userId = res.rows[0].id;
      
      await query(`
        INSERT INTO user_profiles (user_id, tags, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET tags = $2, description = $3
      `, [userId, JSON.stringify(u.tags), u.description]);
    }

    // Mentors seed data
    const mentorsData = [
      { name: "Dr. Tech", email: "drtech@example.com", tags: ["big_tech", "senior developer", "frontend"], description: "Senior Frontend Engineer at Google. Great at resume reviews and mock interviews." },
      { name: "Data Dan", email: "dan@example.com", tags: ["big_tech", "data", "good_communication"], description: "Data Scientist at Meta. Very articulate and helps with job market guidance." },
      { name: "Backend Betty", email: "betty@example.com", tags: ["public company", "backend", "senior developer"], description: "Staff Engineer at Amazon. Strict but excellent mock interviewer." },
      { name: "Product Pete", email: "pete@example.com", tags: ["good_communication", "product", "Ireland"], description: "Product Lead in Ireland. Empathetic and gives great market insights." },
      { name: "Fullstack Fran", email: "fran@example.com", tags: ["startup", "fullstack", "India"], description: "Startup CTO based in India. Technical and practical." }
    ];

    console.log('Seeding mentors and generating embeddings...');
    for (const m of mentorsData) {
      const hash = await bcrypt.hash('mentor123', saltRounds);
      const res = await query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, 'mentor')
        ON CONFLICT (email) DO UPDATE SET name = $1
        RETURNING id
      `, [m.name, m.email, hash]);
      const mentorId = res.rows[0].id;

      await query(`
        INSERT INTO mentor_profiles (user_id, tags, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET tags = $2, description = $3
      `, [mentorId, JSON.stringify(m.tags), m.description]);

      const sourceText = m.tags.join(' ') + ' ' + m.description;
      const output = await extractor(sourceText, { pooling: 'mean', normalize: true });
      const embeddingArray = Array.from(output.data);
      const embeddingStr = '[' + embeddingArray.join(',') + ']';

      await query(`
        INSERT INTO embeddings (owner_id, owner_role, vector, source_text)
        VALUES ($1, 'mentor', $2, $3)
        ON CONFLICT (owner_id) DO UPDATE SET vector = $2, source_text = $3
      `, [mentorId, embeddingStr, sourceText]);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
