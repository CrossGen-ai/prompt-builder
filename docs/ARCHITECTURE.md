# System Architecture

This document describes the architecture, design decisions, and technical implementation of the Memory application.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Performance Optimizations](#performance-optimizations)

## System Overview

Memory is a full-stack TypeScript application built using modern web technologies with a focus on type safety, performance, and developer experience.

### Tech Stack

**Frontend Layer**
- Next.js 15 (App Router) - Server components and streaming
- React 19 - Concurrent rendering and transitions
- TypeScript 5.3 - Strict type checking
- Tailwind CSS v4 - Utility-first styling
- shadCN UI - Accessible component primitives
- Zustand - Lightweight state management

**Backend Layer**
- Next.js API Routes - RESTful endpoints
- Drizzle ORM - Type-safe database queries
- SQLite - Embedded relational database

**Infrastructure**
- Docker - Containerization
- Docker Compose - Orchestration
- Nginx - Reverse proxy (production)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                          NGINX (Production)                      │
│                     Reverse Proxy / Static Files                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ Proxy Pass
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        NEXT.JS 15 SERVER                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              APP ROUTER (Server Components)              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Layout   │  │   Page     │  │  Loading   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           API ROUTES (RESTful Endpoints)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Categories │  │ Fragments  │  │  Compile   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └─────────────────────┬───────────────────────────────────┘  │
│                        │                                        │
│  ┌─────────────────────▼───────────────────────────────────┐  │
│  │              DRIZZLE ORM LAYER                           │  │
│  │         (Type-safe Query Builder)                        │  │
│  └─────────────────────┬───────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ SQL Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                       SQLITE DATABASE                           │
│  ┌─────────────────┐  ┌─────────────────────────────────┐      │
│  │   Categories    │  │     Prompt Fragments            │      │
│  │  - id           │  │  - id                           │      │
│  │  - name         │  │  - content                      │      │
│  │  - description  │  │  - category_id (FK)             │      │
│  │  - order        │  │  - order                        │      │
│  │  - timestamps   │  │  - timestamps                   │      │
│  └─────────────────┘  └─────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT STATE (Browser)                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   ZUSTAND STORE                          │  │
│  │  - categories: Category[]                                │  │
│  │  - fragments: PromptFragment[]                           │  │
│  │  - selectedFragmentIds: Set<string>                      │  │
│  │  - customPrompt: string                                  │  │
│  │  - customEnabled: boolean                                │  │
│  │  - loading: boolean                                      │  │
│  │  - error: string | null                                  │  │
│  │                                                            │  │
│  │  Actions: toggle, set, clear, get                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  REACT COMPONENTS                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Category   │  │  Fragment  │  │   Prompt   │         │  │
│  │  │   List     │  │  Selector  │  │  Preview   │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │                                                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Dialog   │  │   Button   │  │  Checkbox  │         │  │
│  │  │   (Modal)  │  │  (shadCN)  │  │  (shadCN)  │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Page Structure

```
App Root (layout.tsx)
│
├── Provider Wrapper (Zustand)
│
├── Main Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── Theme Toggle
│   │
│   ├── Main Content (page.tsx)
│   │   ├── Sidebar
│   │   │   ├── CategoryList
│   │   │   │   ├── CategoryHeader
│   │   │   │   │   ├── Category Name
│   │   │   │   │   ├── Add Button
│   │   │   │   │   └── Edit/Delete Actions
│   │   │   │   │
│   │   │   │   └── FragmentList (Collapsible)
│   │   │   │       ├── FragmentItem
│   │   │   │       │   ├── Checkbox (Selection)
│   │   │   │       │   ├── Content Preview
│   │   │   │       │   └── Edit/Delete Actions
│   │   │   │       └── Add Fragment Button
│   │   │   │
│   │   │   └── CustomPromptSection
│   │   │       ├── Enable Toggle (Switch)
│   │   │       └── Custom Text (Textarea)
│   │   │
│   │   └── Preview Panel
│   │       ├── Compiled Prompt Display
│   │       │   ├── Fragment Count
│   │       │   ├── Custom Prompt (if enabled)
│   │       │   └── Selected Fragments
│   │       │
│   │       └── Actions
│   │           ├── Copy to Clipboard Button
│   │           └── Clear Selection Button
│   │
│   └── Footer
│       └── Copyright / Links
│
└── Modals (Dialogs)
    ├── AddCategoryDialog
    │   ├── Dialog Content
    │   ├── Form Fields
    │   └── Submit/Cancel Buttons
    │
    ├── EditCategoryDialog
    │   └── (Same structure as Add)
    │
    ├── AddFragmentDialog
    │   └── (Same structure as Add)
    │
    ├── EditFragmentDialog
    │   └── (Same structure as Add)
    │
    └── DeleteConfirmationDialog
        ├── Warning Message
        └── Confirm/Cancel Buttons
```

### Component Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ACTION                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     REACT COMPONENT                         │
│                  (Event Handler)                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE                           │
│                 (State Update Action)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ├─── Local State Update (Optimistic)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API CLIENT                             │
│                   (lib/api.ts)                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTE                         │
│                  (app/api/*/route.ts)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DRIZZLE ORM                              │
│                 (Query Builder)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼ SQL Query
┌─────────────────────────────────────────────────────────────┐
│                  SQLITE DATABASE                            │
│                (Persistent Storage)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼ Response
┌─────────────────────────────────────────────────────────────┐
│                   ZUSTAND STORE                             │
│              (Confirm State Update)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT COMPONENT                            │
│                   (Re-render)                               │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Zustand Store Architecture

```typescript
// Store Structure
{
  // Data State
  categories: Category[]              // All categories from DB
  fragments: PromptFragment[]         // All fragments from DB
  selectedFragmentIds: Set<string>    // User selections
  customPrompt: string                // Custom prompt text
  customEnabled: boolean              // Custom prompt toggle

  // UI State
  loading: boolean                    // Loading indicator
  error: string | null                // Error messages

  // Actions
  setCategories: (categories) => void
  setFragments: (fragments) => void
  toggleFragment: (id) => void
  setCustomPrompt: (text) => void
  setCustomEnabled: (enabled) => void
  clearSelection: () => void
  setLoading: (loading) => void
  setError: (error) => void

  // Computed Values (Selectors)
  getCompiledPrompt: () => CompiledPrompt
  getFragmentsByCategory: (categoryId) => PromptFragment[]
  getSelectedFragments: () => PromptFragment[]
}
```

### State Flow Patterns

**1. Data Fetching**
```typescript
// Initial load
useEffect(() => {
  const loadData = async () => {
    setLoading(true)
    try {
      const [categories, fragments] = await Promise.all([
        api.categories.getAll(),
        api.fragments.getAll()
      ])
      setCategories(categories)
      setFragments(fragments)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  loadData()
}, [])
```

**2. Optimistic Updates**
```typescript
// User toggles fragment
const handleToggle = (fragmentId: string) => {
  // Immediate UI update
  toggleFragment(fragmentId)

  // No API call needed - selections are ephemeral
  // Only persisted when user saves to collection
}
```

**3. Pessimistic Updates**
```typescript
// User creates category
const handleCreate = async (data: CategoryData) => {
  setLoading(true)
  try {
    const newCategory = await api.categories.create(data)
    setCategories([...categories, newCategory])
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

## Database Schema

### Tables

```sql
-- Categories: High-level prompt organization
CREATE TABLE categories (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL,               -- Display name
  description TEXT,                 -- Optional description
  order INTEGER NOT NULL DEFAULT 0, -- Sort order
  created_at TEXT NOT NULL,         -- ISO 8601 timestamp
  updated_at TEXT NOT NULL          -- ISO 8601 timestamp
);

-- Prompt Fragments: Reusable prompt pieces
CREATE TABLE prompt_fragments (
  id TEXT PRIMARY KEY,              -- UUID v4
  content TEXT NOT NULL,            -- Prompt text
  category_id TEXT NOT NULL,        -- Parent category
  order INTEGER NOT NULL DEFAULT 0, -- Sort order within category
  created_at TEXT NOT NULL,         -- ISO 8601 timestamp
  updated_at TEXT NOT NULL,         -- ISO 8601 timestamp

  FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE CASCADE              -- Delete fragments when category deleted
);
```

### Indexes

```sql
-- Performance optimization
CREATE INDEX idx_fragments_category
  ON prompt_fragments(category_id);

CREATE INDEX idx_categories_order
  ON categories(order);

CREATE INDEX idx_fragments_order
  ON prompt_fragments(order);
```

### Future Schema Extensions

```sql
-- For multi-user support
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- For saved prompt collections
CREATE TABLE prompt_collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  fragment_ids TEXT NOT NULL,  -- JSON array
  custom_prompt TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- For sharing prompts
CREATE TABLE shared_prompts (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES prompt_collections(id) ON DELETE CASCADE
);
```

## API Design

### RESTful Endpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                       API STRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

/api
├── /categories                  # Category management
│   ├── GET /                   # List all categories
│   ├── POST /                  # Create category
│   ├── GET /:id                # Get single category
│   ├── PUT /:id                # Update category
│   └── DELETE /:id             # Delete category
│
├── /fragments                   # Fragment management
│   ├── GET /                   # List all fragments
│   │   └── ?categoryId=:id     # Filter by category
│   ├── POST /                  # Create fragment
│   ├── GET /:id                # Get single fragment
│   ├── PUT /:id                # Update fragment
│   └── DELETE /:id             # Delete fragment
│
└── /compile                     # Prompt compilation
    └── POST /                  # Compile selected fragments
```

### Request/Response Formats

**GET /api/categories**
```typescript
// Response: 200 OK
{
  "categories": [
    {
      "id": "uuid-1",
      "name": "Role & Context",
      "description": "Define AI role and context",
      "order": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**POST /api/categories**
```typescript
// Request
{
  "name": "New Category",
  "description": "Optional description",
  "order": 5
}

// Response: 201 Created
{
  "id": "uuid-new",
  "name": "New Category",
  "description": "Optional description",
  "order": 5,
  "createdAt": "2024-01-02T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

**POST /api/compile**
```typescript
// Request
{
  "fragmentIds": ["uuid-1", "uuid-2", "uuid-3"],
  "customPrompt": "Optional custom text"
}

// Response: 200 OK
{
  "prompt": "Compiled prompt text with all fragments...",
  "fragmentCount": 3,
  "customEnabled": true
}
```

### Error Handling

```typescript
// Standard error format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Category name is required",
    "field": "name"
  }
}

// HTTP Status Codes
200 - Success
201 - Created
204 - No Content (delete success)
400 - Bad Request (validation error)
404 - Not Found
500 - Internal Server Error
```

## Security Architecture

### Input Validation

```typescript
// Drizzle schema validation
export const categoryInsertSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0)
})

// API route validation
export async function POST(request: Request) {
  const body = await request.json()
  const validated = categoryInsertSchema.parse(body)
  // ... create category
}
```

### SQL Injection Prevention

```typescript
// ✅ SAFE: Drizzle parameterized queries
const category = await db
  .select()
  .from(categories)
  .where(eq(categories.id, categoryId))

// ❌ UNSAFE: Raw SQL with user input
const query = `SELECT * FROM categories WHERE id = '${categoryId}'`
```

### XSS Protection

```typescript
// React automatic escaping
<div>{userContent}</div>  // ✅ Safe

// Dangerous HTML (never use)
<div dangerouslySetInnerHTML={{ __html: userContent }} />  // ❌
```

### Authentication (Future)

```typescript
// JWT-based authentication flow
export async function authenticateRequest(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) throw new UnauthorizedError()

  const payload = jwt.verify(token, process.env.JWT_SECRET)
  return payload.userId
}
```

## Performance Optimizations

### Database

```typescript
// 1. Indexes on foreign keys
CREATE INDEX idx_fragments_category ON prompt_fragments(category_id)

// 2. Batch queries
const [categories, fragments] = await Promise.all([
  db.select().from(categories),
  db.select().from(fragments)
])

// 3. Limit queries
const recentFragments = await db
  .select()
  .from(fragments)
  .limit(50)
  .orderBy(desc(fragments.createdAt))
```

### React Optimizations

```typescript
// 1. React.memo for expensive components
export const FragmentList = React.memo(({ fragments }) => {
  // ...
})

// 2. useMemo for computed values
const sortedFragments = useMemo(
  () => fragments.sort((a, b) => a.order - b.order),
  [fragments]
)

// 3. useCallback for event handlers
const handleToggle = useCallback(
  (id: string) => toggleFragment(id),
  [toggleFragment]
)

// 4. Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual'
```

### Next.js Optimizations

```typescript
// 1. Server components (default in App Router)
// No JavaScript sent to client for static content

// 2. Streaming with Suspense
<Suspense fallback={<Loading />}>
  <CategoryList />
</Suspense>

// 3. Incremental Static Regeneration
export const revalidate = 60 // Revalidate every 60 seconds

// 4. Image optimization
import Image from 'next/image'
<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### Docker Optimizations

```dockerfile
# 1. Multi-stage builds (smaller image)
FROM node:20-alpine AS builder
# ... build steps

FROM node:20-alpine AS runner
COPY --from=builder /app/.next ./.next

# 2. Layer caching
COPY package*.json ./
RUN npm ci --only=production
COPY . .  # Copy source last for better caching

# 3. Resource limits
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

---

**Note**: This architecture supports future extensions including user authentication, multi-tenancy, prompt sharing, and theme customization without requiring major refactoring.
