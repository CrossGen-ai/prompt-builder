import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Only initialize database on the server side
const isDatabaseAvailable = typeof window === 'undefined' && process.env.DATABASE_URL;

if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create Neon HTTP client (only on server)
const sql = isDatabaseAvailable ? neon(process.env.DATABASE_URL!) : null;

// Create drizzle instance (with fallback for client-side)
export const db = sql ? drizzle(sql, { schema }) : ({} as any);

// Export schema for use in queries
export { schema };

// Export individual tables for direct use
export {
  categories,
  sections,
  selectedSections,
  customPrompt,
  users,
  accounts,
  sessions,
  verificationTokens,
} from './schema';
