import { neon } from '@neondatabase/serverless';

// Run this script to add the password column to the user table
async function addPasswordColumn() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Adding password column to user table...');
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" text`;
    console.log('✓ Password column added successfully!');
  } catch (error) {
    console.error('Error adding password column:', error);
    process.exit(1);
  }
}

addPasswordColumn();
