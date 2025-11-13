import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from app/.env
dotenv.config({ path: path.join(__dirname, '..', 'app', '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Please set it in app/.env file');
  process.exit(1);
}

// Create Neon client and drizzle instance
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function runMigrations() {
  console.log('🚀 Running migrations on Neon database...');

  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigrations();
