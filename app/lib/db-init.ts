import { ensureDatabaseDirectory } from '@/db';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Initialize database with migrations and optional seed
 */
export async function initializeDatabase(options: { seed?: boolean } = {}) {
  const { seed = false } = options;

  try {
    console.log('🔧 Initializing database...');

    // Ensure database directory exists
    ensureDatabaseDirectory();

    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'sqlite.db');
    const dbExists = fs.existsSync(dbPath);

    if (!dbExists) {
      console.log('📦 Database does not exist, creating...');
    }

    // Generate migrations if needed
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
      console.log('📝 Generating migrations...');
      execSync('npm run db:generate', { stdio: 'inherit' });
    }

    // Run migrations
    console.log('🔄 Running migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });

    // Seed if requested and database is new
    if (seed || !dbExists) {
      console.log('🌱 Seeding database...');
      execSync('npm run db:seed', { stdio: 'inherit' });
    }

    console.log('✅ Database initialization complete!');

    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'sqlite.db');
  return fs.existsSync(dbPath);
}

/**
 * Reset database (drop and recreate)
 */
export async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');

    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'sqlite.db');

    // Delete database file if exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️  Deleted existing database');
    }

    // Reinitialize
    await initializeDatabase({ seed: true });

    console.log('✅ Database reset complete!');

    return { success: true };
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
