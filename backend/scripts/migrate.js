import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    const schemaPath = path.join(__dirname, '..', 'migrations', '001_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await query(schemaSql);
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
}

runMigrations();
