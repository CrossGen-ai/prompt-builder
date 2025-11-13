import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Categories table - High-level groupings for prompt sections
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Sections table - Individual prompt components within categories
 */
export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Selected sections table - Tracks which sections are currently selected for prompt compilation
 */
export const selectedSections = pgTable('selected_sections', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  selectedAt: timestamp('selected_at').notNull().defaultNow()
});

/**
 * Custom prompt table - User's custom prompt text that gets appended to compiled sections
 */
export const customPrompt = pgTable('custom_prompt', {
  id: serial('id').primaryKey(),
  content: text('content').notNull().default(''),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

export type SelectedSection = typeof selectedSections.$inferSelect;
export type NewSelectedSection = typeof selectedSections.$inferInsert;

export type CustomPrompt = typeof customPrompt.$inferSelect;
export type NewCustomPrompt = typeof customPrompt.$inferInsert;
