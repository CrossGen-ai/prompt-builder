# AI Prompt Builder - Folder Structure

## Complete Project Structure

```
ai-prompt-builder/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline
│       └── docker-build.yml          # Docker image builds
│
├── app/                              # Next.js 15 App Router
│   ├── (main)/                       # Route group for main app
│   │   ├── layout.tsx                # Main layout with providers
│   │   ├── page.tsx                  # Home page (prompt builder)
│   │   └── error.tsx                 # Error boundary
│   │
│   ├── api/                          # API Route Handlers
│   │   ├── categories/
│   │   │   ├── route.ts              # GET /api/categories
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET/DELETE /api/categories/:id
│   │   ├── sections/
│   │   │   ├── route.ts              # GET /api/sections
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET/DELETE /api/sections/:id
│   │   ├── selections/
│   │   │   └── route.ts              # GET/POST /api/selections
│   │   ├── custom-prompt/
│   │   │   └── route.ts              # GET/PUT /api/custom-prompt
│   │   └── export/
│   │       └── route.ts              # GET /api/export (future)
│   │
│   ├── actions/                      # Server Actions
│   │   ├── categories.ts             # createCategory, updateCategory, deleteCategory
│   │   ├── sections.ts               # createSection, updateSection, deleteSection
│   │   ├── selections.ts             # toggleSelection, clearSelections
│   │   └── custom-prompt.ts          # updateCustomPrompt, toggleCustomPrompt
│   │
│   ├── layout.tsx                    # Root layout
│   ├── global.css                    # Global Tailwind styles
│   └── not-found.tsx                 # 404 page
│
├── components/                       # React Components
│   ├── ui/                           # shadCN UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── collapsible.tsx
│   │
│   ├── prompt-builder/               # Main feature components
│   │   ├── category-section.tsx      # Collapsible category with sections
│   │   ├── category-list.tsx         # List of all categories
│   │   ├── section-item.tsx          # Individual section checkbox
│   │   ├── prompt-preview.tsx        # Live assembled prompt display
│   │   ├── custom-prompt-input.tsx   # Custom text input with toggle
│   │   ├── copy-button.tsx           # Copy to clipboard button
│   │   └── empty-state.tsx           # Empty state placeholder
│   │
│   ├── modals/                       # Modal dialogs
│   │   ├── create-category-modal.tsx
│   │   ├── edit-category-modal.tsx
│   │   ├── delete-category-modal.tsx
│   │   ├── create-section-modal.tsx
│   │   ├── edit-section-modal.tsx
│   │   └── delete-section-modal.tsx
│   │
│   ├── layout/                       # Layout components
│   │   ├── header.tsx                # App header with title
│   │   ├── sidebar.tsx               # Future: settings sidebar
│   │   └── footer.tsx                # App footer
│   │
│   └── providers/                    # Context providers
│       ├── theme-provider.tsx        # Theme context
│       ├── toast-provider.tsx        # Toast notifications
│       └── modal-provider.tsx        # Modal management
│
├── lib/                              # Shared utilities and logic
│   ├── db/                           # Database layer
│   │   ├── index.ts                  # Database client initialization
│   │   ├── schema.ts                 # Drizzle schema definitions
│   │   ├── migrations/               # Database migrations
│   │   │   ├── 0000_initial.sql
│   │   │   ├── 0001_add_indexes.sql
│   │   │   └── meta/
│   │   │       └── _journal.json
│   │   └── seed.ts                   # Seed data for development
│   │
│   ├── repositories/                 # Data access layer
│   │   ├── category-repository.ts
│   │   ├── section-repository.ts
│   │   ├── selection-repository.ts
│   │   └── custom-prompt-repository.ts
│   │
│   ├── services/                     # Business logic layer
│   │   ├── category-service.ts       # Category CRUD operations
│   │   ├── section-service.ts        # Section CRUD operations
│   │   ├── selection-service.ts      # Selection management
│   │   ├── prompt-assembly-service.ts # Prompt assembly logic
│   │   └── export-service.ts         # Export/import (future)
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── category-store.ts         # Categories state
│   │   ├── section-store.ts          # Sections state
│   │   ├── selection-store.ts        # Selected sections state
│   │   ├── custom-prompt-store.ts    # Custom prompt state
│   │   └── ui-store.ts               # UI state (modals, theme)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-categories.ts         # Category data fetching
│   │   ├── use-sections.ts           # Section data fetching
│   │   ├── use-selections.ts         # Selection management
│   │   ├── use-assembled-prompt.ts   # Computed assembled prompt
│   │   ├── use-copy-to-clipboard.ts  # Clipboard functionality
│   │   └── use-theme.ts              # Theme management
│   │
│   ├── validations/                  # Zod validation schemas
│   │   ├── category-schema.ts
│   │   ├── section-schema.ts
│   │   ├── selection-schema.ts
│   │   └── custom-prompt-schema.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── cn.ts                     # classnames utility
│   │   ├── format.ts                 # Date/string formatting
│   │   ├── error-handler.ts          # Error handling utilities
│   │   └── constants.ts              # App-wide constants
│   │
│   └── types/                        # TypeScript type definitions
│       ├── database.ts               # Database types (from Drizzle)
│       ├── api.ts                    # API request/response types
│       ├── store.ts                  # Store state types
│       └── index.ts                  # Barrel exports
│
├── tests/                            # Test files
│   ├── unit/
│   │   ├── services/
│   │   │   ├── category-service.test.ts
│   │   │   ├── section-service.test.ts
│   │   │   └── prompt-assembly-service.test.ts
│   │   ├── repositories/
│   │   │   └── category-repository.test.ts
│   │   └── utils/
│   │       └── format.test.ts
│   │
│   ├── integration/
│   │   ├── api/
│   │   │   ├── categories.test.ts
│   │   │   └── sections.test.ts
│   │   └── actions/
│   │       ├── categories.test.ts
│   │       └── sections.test.ts
│   │
│   └── e2e/
│       ├── prompt-builder.spec.ts
│       └── category-management.spec.ts
│
├── public/                           # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── placeholder.svg
│
├── scripts/                          # Utility scripts
│   ├── db-migrate.ts                 # Run migrations
│   ├── db-seed.ts                    # Seed database
│   ├── db-reset.ts                   # Reset database
│   └── generate-types.ts             # Generate types from schema
│
├── config/                           # Configuration files
│   ├── database.ts                   # Database configuration
│   ├── env.ts                        # Environment variables
│   └── constants.ts                  # App-wide constants
│
├── docs/                             # Documentation
│   ├── architecture/
│   │   ├── 01-system-overview.md
│   │   ├── 02-folder-structure.md
│   │   ├── 03-component-architecture.md
│   │   ├── 04-api-specification.md
│   │   ├── 05-database-schema.md
│   │   └── 06-deployment.md
│   ├── adr/                          # Architecture Decision Records
│   │   ├── 001-nextjs-app-router.md
│   │   ├── 002-sqlite-drizzle.md
│   │   └── 003-zustand-state.md
│   └── guides/
│       ├── development.md
│       └── deployment.md
│
├── .swarm/                           # Claude Flow coordination
│   └── memory.db                     # Swarm memory store
│
├── data/                             # Application data
│   └── app.db                        # SQLite database (volume mount)
│
├── .dockerignore
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── components.json                   # shadCN UI configuration
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts                 # Drizzle configuration
├── next.config.ts                    # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Directory Explanations

### `/app` - Next.js App Router
- **Route Groups**: `(main)` for organization without affecting URL structure
- **Server Actions**: Collocated with route handlers for mutations
- **API Routes**: RESTful endpoints for data fetching

### `/components` - React Components
- **ui/**: shadCN components (auto-generated, customizable)
- **prompt-builder/**: Feature-specific components
- **modals/**: Dialog components for CRUD operations
- **layout/**: App shell components
- **providers/**: Context/provider components

### `/lib` - Business Logic
- **db/**: Database client and schema
- **repositories/**: Direct database access (CRUD)
- **services/**: Business logic layer
- **stores/**: Zustand state management
- **hooks/**: Custom React hooks
- **validations/**: Zod schemas
- **utils/**: Pure utility functions
- **types/**: TypeScript definitions

### `/tests` - Testing
- **unit/**: Service and utility tests
- **integration/**: API and action tests
- **e2e/**: End-to-end Playwright tests

### `/docs` - Documentation
- **architecture/**: System design documents
- **adr/**: Architecture decision records
- **guides/**: Developer guides

## File Naming Conventions

### Components
- **PascalCase**: `CategorySection.tsx` → exported as `CategorySection`
- **kebab-case**: `category-section.tsx` → modern Next.js convention

### Services & Repositories
- **kebab-case**: `category-service.ts`, `section-repository.ts`

### Hooks
- **kebab-case with prefix**: `use-categories.ts`

### Types
- **kebab-case**: `database.ts`, `api.ts`

### Tests
- **Same as source + .test**: `category-service.test.ts`

## Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/types/*": ["./lib/types/*"]
    }
  }
}
```

## Module Boundaries

```
┌─────────────────────────────────────────────────┐
│                  Components                      │
│  (UI only, no direct DB access)                 │
└──────────────────┬──────────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────────┐
│             Hooks & Stores                       │
│  (State management, data fetching)              │
└──────────────────┬──────────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────────┐
│        Server Actions & API Routes               │
│  (Request handling, validation)                 │
└──────────────────┬──────────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────────┐
│              Services                            │
│  (Business logic, orchestration)                │
└──────────────────┬──────────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────────┐
│            Repositories                          │
│  (Data access, SQL queries)                     │
└──────────────────┬──────────────────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────────────────┐
│              Database                            │
│  (Drizzle client, schema)                       │
└─────────────────────────────────────────────────┘
```

## Build Output

```
.next/
├── cache/                   # Build cache
├── server/                  # Server-side code
│   ├── app/                 # App router pages
│   └── chunks/              # Code chunks
├── static/                  # Static assets
│   ├── chunks/              # Client chunks
│   └── css/                 # CSS files
└── types/                   # Generated types
```

## Data Directory

```
data/
├── app.db                   # SQLite database (production)
├── app.db-shm               # Shared memory file
└── app.db-wal               # Write-ahead log
```

## Environment Files

```
.env.local                   # Local development (gitignored)
.env.example                 # Example template (committed)
.env.production              # Production secrets (gitignored)
```

## Key Architectural Benefits

1. **Clear Separation**: UI → Hooks → Actions → Services → Repositories → DB
2. **Type Safety**: TypeScript + Drizzle end-to-end
3. **Testability**: Each layer independently testable
4. **Scalability**: Easy to add features without restructuring
5. **Maintainability**: Consistent patterns across codebase
6. **Developer Experience**: Intuitive file organization

## Migration Path

### Current Structure → Multi-user
1. Add `/lib/auth/` directory
2. Add `user_id` columns to tables
3. Update repositories with user scoping
4. Add authentication middleware
5. No restructuring needed!

### Current Structure → Microservices
1. Extract `/lib/services/` to separate services
2. Replace repositories with API clients
3. Keep component structure identical
4. Update data fetching hooks
