# AI Prompt Builder - Backend API Documentation

## Overview

This backend uses **Next.js 15 Server Actions** with **Drizzle ORM** and **SQLite** for a production-ready, type-safe API.

## Database Schema

### Tables

#### `categories`
- `id`: Primary key (auto-increment)
- `name`: Category name (required)
- `description`: Category description (optional)
- `displayOrder`: Sort order (default: 0)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### `sections`
- `id`: Primary key (auto-increment)
- `categoryId`: Foreign key to categories
- `title`: Section title (required)
- `content`: Section content/prompt text (required)
- `description`: Section description (optional)
- `displayOrder`: Sort order (default: 0)
- `isDefault`: Auto-select flag (default: false)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### `selected_sections`
- `id`: Primary key (auto-increment)
- `sectionId`: Foreign key to sections
- `selectedAt`: Selection timestamp

#### `custom_prompt`
- `id`: Primary key (auto-increment)
- `content`: Custom prompt text
- `updatedAt`: Timestamp

## Server Actions API

All actions return `ActionResponse<T>`:
```typescript
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Category Actions

Import from: `@/app/actions`

#### `getCategories()`
Get all categories with their sections.

**Returns:** `ActionResponse<CategoryWithSections[]>`

**Example:**
```typescript
const result = await getCategories();
if (result.success) {
  console.log(result.data); // Array of categories with sections
}
```

#### `getCategoryById(id: number)`
Get a single category with sections.

**Parameters:**
- `id`: Category ID

**Returns:** `ActionResponse<CategoryWithSections>`

#### `createCategory(input: CreateCategoryInput)`
Create a new category.

**Input:**
```typescript
{
  name: string;           // Required, max 100 chars
  description?: string;   // Optional
  displayOrder?: number;  // Optional, default 0
}
```

**Returns:** `ActionResponse<CategoryWithSections>`

#### `updateCategory(input: UpdateCategoryInput)`
Update an existing category.

**Input:**
```typescript
{
  id: number;             // Required
  name?: string;          // Optional, max 100 chars
  description?: string;   // Optional
  displayOrder?: number;  // Optional
}
```

**Returns:** `ActionResponse<CategoryWithSections>`

#### `deleteCategory(id: number)`
Delete a category (cascades to sections).

**Parameters:**
- `id`: Category ID

**Returns:** `ActionResponse<void>`

---

### Section Actions

#### `getSections()`
Get all sections.

**Returns:** `ActionResponse<Section[]>`

#### `getSectionById(id: number)`
Get a single section with category.

**Parameters:**
- `id`: Section ID

**Returns:** `ActionResponse<SectionWithCategory>`

#### `getSectionsByCategory(categoryId: number)`
Get all sections for a category.

**Parameters:**
- `categoryId`: Category ID

**Returns:** `ActionResponse<Section[]>`

#### `createSection(input: CreateSectionInput)`
Create a new section.

**Input:**
```typescript
{
  categoryId: number;     // Required
  title: string;          // Required, max 200 chars
  content: string;        // Required
  description?: string;   // Optional
  displayOrder?: number;  // Optional, default 0
  isDefault?: boolean;    // Optional, default false
}
```

**Returns:** `ActionResponse<Section>`

#### `updateSection(input: UpdateSectionInput)`
Update an existing section.

**Input:**
```typescript
{
  id: number;             // Required
  categoryId?: number;    // Optional
  title?: string;         // Optional, max 200 chars
  content?: string;       // Optional
  description?: string;   // Optional
  displayOrder?: number;  // Optional
  isDefault?: boolean;    // Optional
}
```

**Returns:** `ActionResponse<Section>`

#### `deleteSection(input: { id: number })`
Delete a section.

**Input:**
```typescript
{
  id: number;  // Section ID
}
```

**Returns:** `ActionResponse<void>`

---

### Selection Actions

#### `getSelectedSections()`
Get all currently selected sections with details.

**Returns:** `ActionResponse<SelectedSectionWithDetails[]>`

#### `selectSection(input: { id: number })`
Select a section for prompt compilation.

**Input:**
```typescript
{
  id: number;  // Section ID
}
```

**Returns:** `ActionResponse<SelectedSection>`

#### `deselectSection(input: { id: number })`
Deselect a section from prompt compilation.

**Input:**
```typescript
{
  id: number;  // Section ID
}
```

**Returns:** `ActionResponse<void>`

#### `toggleSectionSelection(input: { id: number })`
Toggle section selection state.

**Input:**
```typescript
{
  id: number;  // Section ID
}
```

**Returns:** `ActionResponse<{ selected: boolean }>`

#### `clearAllSelections()`
Clear all selected sections.

**Returns:** `ActionResponse<void>`

#### `selectDefaultSections()`
Select all sections marked as default.

**Returns:** `ActionResponse<number>`
(Returns count of selected sections)

---

### Prompt Actions

#### `getCompiledPrompt()`
Get the compiled prompt from selected sections and custom prompt.

**Returns:** `ActionResponse<CompiledPrompt>`

**Response Structure:**
```typescript
{
  sections: {
    category: string;
    sections: {
      title: string;
      content: string;
    }[];
  }[];
  customPrompt: string;
  fullPrompt: string;  // Complete compiled prompt text
}
```

#### `getCustomPrompt()`
Get the current custom prompt.

**Returns:** `ActionResponse<CustomPrompt>`

#### `updateCustomPrompt(input: { content: string })`
Update the custom prompt.

**Input:**
```typescript
{
  content: string;  // Max 10,000 chars
}
```

**Returns:** `ActionResponse<CustomPrompt>`

#### `clearCustomPrompt()`
Clear the custom prompt.

**Returns:** `ActionResponse<void>`

---

## Database Setup

### Installation

```bash
npm install
```

### Generate Migrations

```bash
npm run db:generate
```

### Run Migrations

```bash
npm run db:migrate
```

### Seed Database

```bash
npm run db:seed
```

### Database Studio (GUI)

```bash
npm run db:studio
```

### Complete Setup (First Time)

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Usage in Components

### Client Component Example

```typescript
'use client';

import { getCategories, selectSection } from '@/app/actions';
import { useState } from 'react';

export default function PromptBuilder() {
  const [categories, setCategories] = useState([]);

  async function loadCategories() {
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data);
    } else {
      console.error(result.error);
    }
  }

  async function handleSelectSection(sectionId: number) {
    const result = await selectSection({ id: sectionId });
    if (result.success) {
      // Refresh data or update UI
    }
  }

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

### Server Component Example

```typescript
import { getCategories, getCompiledPrompt } from '@/app/actions';

export default async function PromptPage() {
  const categoriesResult = await getCategories();
  const promptResult = await getCompiledPrompt();

  if (!categoriesResult.success || !promptResult.success) {
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <h1>Categories: {categoriesResult.data.length}</h1>
      <pre>{promptResult.data.fullPrompt}</pre>
    </div>
  );
}
```

## Error Handling

All actions include built-in error handling and validation:

```typescript
const result = await createSection({
  categoryId: 1,
  title: 'My Section',
  content: 'Section content'
});

if (result.success) {
  console.log('Created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Type Safety

All inputs are validated with Zod schemas:

- `createCategorySchema`
- `updateCategorySchema`
- `createSectionSchema`
- `updateSectionSchema`
- `sectionIdSchema`
- `customPromptSchema`

TypeScript types are automatically inferred from the database schema.

## Environment Variables

Create a `.env` file based on `.env.sample`:

```env
DATABASE_URL=./data/sqlite.db
NODE_ENV=development
```

## Project Structure

```
/Users/seanpatterson/Memory/
├── app/
│   ├── actions/
│   │   ├── categories.ts      # Category Server Actions
│   │   ├── sections.ts        # Section Server Actions
│   │   ├── selections.ts      # Selection Server Actions
│   │   ├── prompt.ts          # Prompt Server Actions
│   │   └── index.ts           # Centralized exports
│   └── lib/
│       ├── types.ts           # TypeScript types
│       ├── validations.ts     # Zod schemas
│       └── db-init.ts         # Database utilities
├── db/
│   ├── schema.ts              # Drizzle schema
│   ├── index.ts               # Database instance
│   ├── migrate.ts             # Migration runner
│   ├── seed.ts                # Seed script
│   └── migrations/            # Generated migrations
├── drizzle.config.ts          # Drizzle configuration
└── package.json               # Dependencies & scripts
```

## Performance Notes

- **WAL mode** enabled for better concurrent access
- **Foreign key cascades** for data integrity
- **Indexed queries** via Drizzle's query builder
- **Type-safe** operations with zero runtime overhead
- **Server Actions** with automatic revalidation

## Security

- Input validation with Zod
- SQL injection protection via Drizzle ORM
- Type safety at compile time
- No exposed database credentials
- Server-side only execution
