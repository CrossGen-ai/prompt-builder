-- Rename sections table to prompt_fragments
ALTER TABLE "sections" RENAME TO "prompt_fragments";

-- Rename selected_sections table to selected_prompt_fragments
ALTER TABLE "selected_sections" RENAME TO "selected_prompt_fragments";

-- Rename section_id column to prompt_fragment_id in selected_prompt_fragments
ALTER TABLE "selected_prompt_fragments" RENAME COLUMN "section_id" TO "prompt_fragment_id";

-- Update indexes and constraints (they should follow automatically with table rename)
-- Drizzle will handle the foreign key constraint names automatically
