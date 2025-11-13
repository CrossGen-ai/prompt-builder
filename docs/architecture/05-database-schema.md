# AI Prompt Builder - Database Schema

## Schema Design

The database uses **SQLite** with **Drizzle ORM** for type-safe queries.

### Entity-Relationship Diagram

```
┌─────────────────────┐
│     categories      │
├─────────────────────┤
│ id (PK)             │──┐
│ name                │  │
│ created_at          │  │
└─────────────────────┘  │
                         │ 1:N
                         │
                         ▼
                    ┌─────────────────────┐
                    │      sections       │
                    ├─────────────────────┤
                    │ id (PK)             │──┐
                    │ category_id (FK)    │  │
                    │ description         │  │
                    │ prompt_text         │  │
                    │ created_at          │  │
                    └─────────────────────┘  │
                                             │ 1:N
                                             │
                                             ▼
                                        ┌─────────────────────┐
                                        │ selected_sections   │
                                        ├─────────────────────┤
                                        │ id (PK)             │
                                        │ section_id (FK)     │
                                        │ created_at          │
                                        └─────────────────────┘

┌─────────────────────┐
│   custom_prompt     │
├─────────────────────┤
│ id (PK)             │
│ text                │
│ enabled             │
│ updated_at          │
└─────────────────────┘
```

---

## Table Definitions

### `categories`

Stores prompt categories (e.g., "Role Definition", "Output Format").

```typescript
// lib/db/schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

**Columns**:
- `id`: Auto-incrementing primary key
- `name`: Unique category name (e.g., "Context Setting")
- `created_at`: ISO timestamp of creation

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_categories_name ON categories(name);
```

**Sample Data**:
```sql
INSERT INTO categories (name) VALUES
  ('Role Definition'),
  ('Context Setting'),
  ('Output Format'),
  ('Constraints');
```

---

### `sections`

Stores individual prompt sections within categories.

```typescript
export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  promptText: text('prompt_text').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

**Columns**:
- `id`: Auto-incrementing primary key
- `category_id`: Foreign key to `categories`
- `description`: Short description (shown in UI)
- `prompt_text`: Actual prompt fragment
- `created_at`: ISO timestamp

**Foreign Keys**:
```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
```

**Indexes**:
```sql
CREATE INDEX idx_sections_category_id ON sections(category_id);
```

**Sample Data**:
```sql
INSERT INTO sections (category_id, description, prompt_text) VALUES
  (1, 'Expert Assistant', 'You are an expert AI assistant specialized in...'),
  (1, 'Code Reviewer', 'Act as a senior code reviewer with expertise in...'),
  (2, 'Web Development', 'Context: Building a modern web application using...'),
  (3, 'Markdown Format', 'Format your response in clean markdown with...');
```

---

### `selected_sections`

Tracks which sections are currently selected by the user.

```typescript
export const selectedSections = sqliteTable('selected_sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sectionId: integer('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

**Columns**:
- `id`: Auto-incrementing primary key
- `section_id`: Foreign key to `sections`
- `created_at`: When selection was made

**Foreign Keys**:
```sql
FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
```

**Constraints**:
```sql
CREATE UNIQUE INDEX idx_selected_sections_section_id
ON selected_sections(section_id);
```
*Ensures each section can only be selected once*

**Indexes**:
```sql
CREATE INDEX idx_selected_sections_created_at ON selected_sections(created_at);
```

---

### `custom_prompt`

Stores the user's custom prompt text and enabled state (singleton table).

```typescript
export const customPrompt = sqliteTable('custom_prompt', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().default(''),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

**Columns**:
- `id`: Primary key (always 1)
- `text`: Custom prompt content (max 10,000 chars)
- `enabled`: Whether to include in assembled prompt
- `updated_at`: Last modification timestamp

**Constraints**:
```sql
-- Ensure only one row exists
CREATE TRIGGER ensure_single_custom_prompt
BEFORE INSERT ON custom_prompt
WHEN (SELECT COUNT(*) FROM custom_prompt) >= 1
BEGIN
  SELECT RAISE(FAIL, 'Only one custom prompt allowed');
END;
```

**Initial Data**:
```sql
INSERT INTO custom_prompt (id, text, enabled) VALUES (1, '', false);
```

---

## Drizzle Schema Definition

Full schema file with TypeScript types:

```typescript
// lib/db/schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Tables
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const sections = sqliteTable('sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  promptText: text('prompt_text').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const selectedSections = sqliteTable('selected_sections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sectionId: integer('section_id')
    .notNull()
    .references(() => sections.id, { onDelete: 'cascade' })
    .unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const customPrompt = sqliteTable('custom_prompt', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull().default(''),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  category: one(categories, {
    fields: [sections.categoryId],
    references: [categories.id],
  }),
  selections: many(selectedSections),
}));

export const selectedSectionsRelations = relations(selectedSections, ({ one }) => ({
  section: one(sections, {
    fields: [selectedSections.sectionId],
    references: [sections.id],
  }),
}));

// TypeScript Types
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Section = InferSelectModel<typeof sections>;
export type NewSection = InferInsertModel<typeof sections>;

export type SelectedSection = InferSelectModel<typeof selectedSections>;
export type NewSelectedSection = InferInsertModel<typeof selectedSections>;

export type CustomPrompt = InferSelectModel<typeof customPrompt>;
export type NewCustomPrompt = InferInsertModel<typeof customPrompt>;
```

---

## Database Migrations

### Migration 0000: Initial Schema

```sql
-- lib/db/migrations/0000_initial.sql

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS selected_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_prompt (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_sections_category_id ON sections(category_id);
CREATE UNIQUE INDEX idx_selected_sections_section_id ON selected_sections(section_id);
CREATE INDEX idx_selected_sections_created_at ON selected_sections(created_at);

-- Singleton constraint for custom_prompt
INSERT INTO custom_prompt (id, text, enabled) VALUES (1, '', 0);
```

---

### Migration 0001: Add Performance Indexes

```sql
-- lib/db/migrations/0001_add_indexes.sql

-- Composite index for frequently joined queries
CREATE INDEX idx_sections_category_created
ON sections(category_id, created_at DESC);

-- Full-text search index for sections (future)
-- CREATE VIRTUAL TABLE sections_fts USING fts5(description, prompt_text);
```

---

## Repository Layer

### CategoryRepository

```typescript
// lib/repositories/category-repository.ts
import { db } from '@/lib/db';
import { categories, sections } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export class CategoryRepository {
  static async findAll() {
    return await db
      .select({
        id: categories.id,
        name: categories.name,
        createdAt: categories.createdAt,
        sectionCount: count(sections.id),
      })
      .from(categories)
      .leftJoin(sections, eq(categories.id, sections.categoryId))
      .groupBy(categories.id)
      .orderBy(desc(categories.createdAt));
  }

  static async findById(id: number) {
    return await db.query.categories.findFirst({
      where: eq(categories.id, id),
      with: {
        sections: true,
      },
    });
  }

  static async create(data: { name: string }) {
    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();
    return category;
  }

  static async update(id: number, data: { name: string }) {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  static async delete(id: number) {
    await db.delete(categories).where(eq(categories.id, id));
  }
}
```

---

### SectionRepository

```typescript
// lib/repositories/section-repository.ts
import { db } from '@/lib/db';
import { sections, selectedSections } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class SectionRepository {
  static async findAll() {
    return await db
      .select({
        id: sections.id,
        categoryId: sections.categoryId,
        description: sections.description,
        promptText: sections.promptText,
        createdAt: sections.createdAt,
        isSelected: sql<boolean>`
          CASE WHEN ${selectedSections.sectionId} IS NOT NULL
          THEN 1 ELSE 0 END
        `,
      })
      .from(sections)
      .leftJoin(selectedSections, eq(sections.id, selectedSections.sectionId))
      .orderBy(desc(sections.createdAt));
  }

  static async findByCategory(categoryId: number) {
    return await db
      .select()
      .from(sections)
      .where(eq(sections.categoryId, categoryId))
      .orderBy(desc(sections.createdAt));
  }

  static async create(data: {
    categoryId: number;
    description: string;
    promptText: string;
  }) {
    const [section] = await db
      .insert(sections)
      .values(data)
      .returning();
    return section;
  }

  static async update(
    id: number,
    data: { description?: string; promptText?: string }
  ) {
    const [section] = await db
      .update(sections)
      .set(data)
      .where(eq(sections.id, id))
      .returning();
    return section;
  }

  static async delete(id: number) {
    await db.delete(sections).where(eq(sections.id, id));
  }
}
```

---

### SelectionRepository

```typescript
// lib/repositories/selection-repository.ts
import { db } from '@/lib/db';
import { selectedSections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class SelectionRepository {
  static async findAll() {
    return await db.query.selectedSections.findMany({
      with: {
        section: true,
      },
    });
  }

  static async isSelected(sectionId: number) {
    const result = await db.query.selectedSections.findFirst({
      where: eq(selectedSections.sectionId, sectionId),
    });
    return !!result;
  }

  static async select(sectionId: number) {
    const [selection] = await db
      .insert(selectedSections)
      .values({ sectionId })
      .returning();
    return selection;
  }

  static async deselect(sectionId: number) {
    await db
      .delete(selectedSections)
      .where(eq(selectedSections.sectionId, sectionId));
  }

  static async clearAll() {
    await db.delete(selectedSections);
  }
}
```

---

## Database Configuration

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database(process.env.DATABASE_URL || 'data/app.db');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
```

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'data/app.db',
  },
} satisfies Config;
```

---

## Seed Data

```typescript
// lib/db/seed.ts
import { db } from './index';
import { categories, sections } from './schema';

async function seed() {
  // Categories
  const [roleCategory] = await db
    .insert(categories)
    .values({ name: 'Role Definition' })
    .returning();

  const [contextCategory] = await db
    .insert(categories)
    .values({ name: 'Context Setting' })
    .returning();

  const [formatCategory] = await db
    .insert(categories)
    .values({ name: 'Output Format' })
    .returning();

  // Sections
  await db.insert(sections).values([
    {
      categoryId: roleCategory.id,
      description: 'Expert AI Assistant',
      promptText: 'You are an expert AI assistant with deep knowledge across multiple domains.',
    },
    {
      categoryId: roleCategory.id,
      description: 'Code Reviewer',
      promptText: 'Act as a senior code reviewer focused on best practices and maintainability.',
    },
    {
      categoryId: contextCategory.id,
      description: 'Web Development Project',
      promptText: 'Context: Building a modern web application with Next.js 15 and TypeScript.',
    },
    {
      categoryId: formatCategory.id,
      description: 'Markdown Format',
      promptText: 'Format your response in clean markdown with headings, lists, and code blocks.',
    },
  ]);

  console.log('✅ Database seeded successfully');
}

seed().catch(console.error);
```

---

## Performance Optimization

### Query Optimization
1. **Indexes**: Added on frequently queried columns
2. **Joins**: Left joins with aggregation for counts
3. **Pagination**: Future support for large datasets

### SQLite Optimization
```sql
-- Enable Write-Ahead Logging
PRAGMA journal_mode = WAL;

-- Set cache size (in KB)
PRAGMA cache_size = -64000; -- 64MB

-- Enable memory-mapped I/O
PRAGMA mmap_size = 268435456; -- 256MB
```

### Drizzle Query Optimization
```typescript
// ✅ Efficient: Single query with join
const categoriesWithCounts = await db
  .select({
    ...categories,
    sectionCount: count(sections.id),
  })
  .from(categories)
  .leftJoin(sections, eq(categories.id, sections.categoryId))
  .groupBy(categories.id);

// ❌ Inefficient: N+1 queries
const categories = await db.select().from(categories);
for (const category of categories) {
  const sections = await db.select().from(sections).where(...);
}
```

---

## Future Extensions

### Multi-User Support
```sql
-- Add user table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to all tables
ALTER TABLE categories ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE custom_prompt ADD COLUMN user_id INTEGER REFERENCES users(id);
```

### Versioning
```sql
-- Track changes
CREATE TABLE category_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Full-Text Search
```sql
-- FTS5 virtual table
CREATE VIRTUAL TABLE sections_fts USING fts5(
  description,
  prompt_text,
  content=sections
);
```
