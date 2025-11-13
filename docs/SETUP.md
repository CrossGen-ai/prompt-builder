# AI Prompt Builder - Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the sample environment file:

```bash
cp .env.sample .env
```

The default configuration uses SQLite with the database stored at `./data/sqlite.db`.

### 3. Initialize Database

Generate migrations, run them, and seed with default data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Verify Setup

The seed script creates:
- **6 categories**: Context & Role, Task Definition, Constraints & Guidelines, Output Format, Examples & References, Tone & Style
- **21 prompt sections**: Various templates across all categories
- **Default sections marked** for auto-selection

## Available Scripts

### Database Management

- `npm run db:generate` - Generate Drizzle migrations from schema
- `npm run db:migrate` - Run pending migrations
- `npm run db:seed` - Seed database with default data
- `npm run db:studio` - Open Drizzle Studio GUI

### Development

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Schema Overview

### Categories
High-level groupings for prompt sections (e.g., "Context & Role", "Task Definition")

### Sections
Individual prompt templates within categories that can be selected to build a final prompt

### Selected Sections
Tracks which sections are currently selected for compilation

### Custom Prompt
User's custom text that gets appended to the compiled prompt

## Using Server Actions

All backend functionality is exposed via Next.js 15 Server Actions:

```typescript
import {
  getCategories,
  createSection,
  toggleSectionSelection,
  getCompiledPrompt
} from '@/app/actions';

// In a Server Component
const categories = await getCategories();

// In a Client Component
'use client';
async function handleSelect(id: number) {
  const result = await toggleSectionSelection({ id });
  if (result.success) {
    // Update UI
  }
}
```

## Default Seed Data

The seed script populates:

### Categories (6)
1. Context & Role
2. Task Definition
3. Constraints & Guidelines
4. Output Format
5. Examples & References
6. Tone & Style

### Sections (21)
Each category has 3-4 pre-built prompt templates with:
- Title and description
- Ready-to-use content with placeholders
- Display order for organization
- Default selection flags

### Example Sections

**Context & Role:**
- Expert Role
- Professional Context
- Technical Specialist

**Task Definition:**
- Clear Objective
- Multi-Step Process
- Problem-Solving Task

**Output Format:**
- Structured Response
- JSON Output
- Code Documentation

And more...

## API Documentation

See `/docs/BACKEND_API.md` for complete API documentation including:
- All Server Actions
- Input/output types
- Error handling
- Usage examples

## Troubleshooting

### Database not found

```bash
npm run db:migrate
```

### Need fresh start

```bash
rm -rf data/
npm run db:migrate
npm run db:seed
```

### Check database contents

```bash
npm run db:studio
```

Opens Drizzle Studio at http://localhost:4983

## Type Safety

All operations are fully type-safe:

```typescript
// TypeScript knows the exact shape
const result = await getCategories();
if (result.success) {
  // result.data is CategoryWithSections[]
  result.data.forEach(cat => {
    console.log(cat.name); // ✅ Type-safe
    console.log(cat.sections); // ✅ Type-safe
  });
}
```

## Production Considerations

### Database

- SQLite with WAL mode for concurrency
- Migrations tracked automatically
- Foreign key cascades for data integrity

### Performance

- Server Actions run server-side only
- Automatic request deduplication
- Revalidation on mutations

### Security

- Input validation with Zod
- SQL injection protection via ORM
- No direct database exposure

## Next Steps

1. Build your frontend UI
2. Import Server Actions from `@/app/actions`
3. Call actions from Client or Server Components
4. Use TypeScript types from `@/app/lib/types`

## File Locations

```
/Users/seanpatterson/Memory/
├── app/
│   ├── actions/          # Server Actions (import these)
│   └── lib/              # Types and utilities
├── db/
│   ├── schema.ts         # Database schema
│   ├── seed.ts           # Seed data
│   └── migrations/       # Auto-generated migrations
├── data/                 # SQLite database (created on first run)
├── docs/                 # Documentation
│   ├── BACKEND_API.md    # API reference
│   └── SETUP.md          # This file
└── package.json          # Scripts and dependencies
```

## Support

For issues or questions:
1. Check `/docs/BACKEND_API.md` for API details
2. Run `npm run db:studio` to inspect database
3. Check console logs for error details
