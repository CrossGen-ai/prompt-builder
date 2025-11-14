import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const sql = neon(process.env.DATABASE_URL)

const migrationSQL = `
-- Rename sections table to prompt_fragments
ALTER TABLE "sections" RENAME TO "prompt_fragments";

-- Rename selected_sections table to selected_prompt_fragments
ALTER TABLE "selected_sections" RENAME TO "selected_prompt_fragments";

-- Rename section_id column to prompt_fragment_id in selected_prompt_fragments
ALTER TABLE "selected_prompt_fragments" RENAME COLUMN "section_id" TO "prompt_fragment_id";
`

console.log('Applying database migration...')
console.log(migrationSQL)

try {
  // Execute each statement separately
  await sql`ALTER TABLE "sections" RENAME TO "prompt_fragments"`
  console.log('✅ Renamed sections → prompt_fragments')

  await sql`ALTER TABLE "selected_sections" RENAME TO "selected_prompt_fragments"`
  console.log('✅ Renamed selected_sections → selected_prompt_fragments')

  await sql`ALTER TABLE "selected_prompt_fragments" RENAME COLUMN "section_id" TO "prompt_fragment_id"`
  console.log('✅ Renamed column section_id → prompt_fragment_id')

  console.log('\n✅ All migrations applied successfully!')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
