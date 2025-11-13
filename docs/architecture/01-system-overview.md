# AI Prompt Builder - System Architecture Overview

## Executive Summary

The AI Prompt Builder is a Next.js 15 application that enables users to construct AI prompts through a modular, category-based interface. Users can select prompt fragments organized by categories, preview the assembled prompt in real-time, and manage custom additions.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadCN UI (latest)
- **State Management**: Zustand 4.x
- **Icons**: lucide-react

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js Server Actions + Route Handlers
- **Database**: SQLite (better-sqlite3)
- **ORM**: Drizzle ORM
- **Validation**: Zod

### DevOps
- **Containerization**: Docker (multi-stage build)
- **Package Manager**: npm/pnpm
- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 App Router (Client Components)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Category   │ │   Prompt     │ │   Settings   │        │
│  │   Browser    │ │   Preview    │ │   Panel      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         Zustand State Management                 │       │
│  │  - Categories Store                              │       │
│  │  - Sections Store                                │       │
│  │  - Selection Store                               │       │
│  │  - UI Store (modals, theme)                      │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/RSC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 15 Server (Node.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Server Components & Actions                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Server     │ │    Route     │ │   Metadata   │        │
│  │   Actions    │ │   Handlers   │ │   Handlers   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         Business Logic Layer                     │       │
│  │  - Category Service                              │       │
│  │  - Section Service                               │       │
│  │  - Selection Service                             │       │
│  │  - Prompt Assembly Service                       │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────┐       │
│  │         Data Access Layer (Drizzle)              │       │
│  │  - Category Repository                           │       │
│  │  - Section Repository                            │       │
│  │  - Selection Repository                          │       │
│  │  - Custom Prompt Repository                      │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ categories   │ │   sections   │ │   selected   │        │
│  │              │ │              │ │   _sections  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐                                           │
│  │   custom     │                                           │
│  │   _prompt    │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Core Architecture Principles

### 1. **Separation of Concerns**
- Clear boundaries between UI, business logic, and data access
- Server Actions for mutations, Route Handlers for queries
- Client components only for interactivity

### 2. **Type Safety**
- End-to-end TypeScript with strict mode
- Drizzle ORM for type-safe database queries
- Zod schemas for runtime validation

### 3. **Performance Optimization**
- Server Components by default (Next.js 15)
- Client components only where needed
- React 19 optimistic updates
- Efficient SQLite queries with proper indexing

### 4. **Scalability & Extensibility**
- Modular service layer for easy feature addition
- Plugin architecture for future authentication
- Theme system for customization
- Export/import ready structure

### 5. **Developer Experience**
- Consistent file structure
- Clear naming conventions
- Comprehensive type definitions
- Hot module replacement in development

## Data Flow

### 1. **Initial Page Load**
```
Browser → Server Component → Drizzle Query → SQLite
→ Server Component (with data) → Client Component (hydration)
→ Zustand Store (initialization)
```

### 2. **User Selection**
```
User Click → Zustand Action → Optimistic Update → Server Action
→ Database Write → Revalidation → Store Update
```

### 3. **Prompt Assembly**
```
Selection Change → Zustand Selector → Computed Prompt
→ Real-time Preview Update
```

### 4. **CRUD Operations**
```
User Action → Modal Open → Form Submission → Server Action
→ Validation (Zod) → Service Layer → Repository → Database
→ Revalidation → UI Update
```

## Security Considerations

### Current Phase
- Input validation with Zod schemas
- SQL injection prevention (Drizzle parameterized queries)
- XSS protection (React automatic escaping)
- CSRF protection (Next.js built-in)

### Future Phase (Multi-user)
- Authentication middleware (NextAuth.js ready)
- Authorization layer (user-scoped queries)
- Rate limiting (per-user API throttling)
- Session management (secure cookies)

## Performance Targets

- **Time to Interactive**: < 2s
- **Largest Contentful Paint**: < 1.5s
- **Cumulative Layout Shift**: < 0.1
- **Database Query Time**: < 10ms (SQLite in-memory)
- **API Response Time**: < 100ms (p95)

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                │
│  ┌───────────────────────────────────┐ │
│  │   Next.js Production Build        │ │
│  │   (node server.js)                │ │
│  └───────────────────────────────────┘ │
│                 │                       │
│                 ▼                       │
│  ┌───────────────────────────────────┐ │
│  │   SQLite Database                 │ │
│  │   (Volume Mount)                  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         │ Port 3000
         ▼
    Reverse Proxy (Optional)
         │
         ▼
      Internet
```

## Architecture Decision Records (ADRs)

### ADR-001: Next.js 15 App Router
**Decision**: Use Next.js 15 App Router over Pages Router
**Rationale**:
- Server Components reduce client bundle
- Better TypeScript integration
- Improved data fetching patterns
- Future-proof architecture

### ADR-002: SQLite with Drizzle
**Decision**: Use SQLite with Drizzle ORM over PostgreSQL/Prisma
**Rationale**:
- Simpler deployment (no external DB)
- Excellent performance for read-heavy workloads
- Drizzle provides better TypeScript inference
- Easy migration path to PostgreSQL later

### ADR-003: Zustand for State Management
**Decision**: Use Zustand over Redux/Context API
**Rationale**:
- Minimal boilerplate
- Excellent TypeScript support
- No provider wrapping needed
- Built-in devtools integration

### ADR-004: Server Actions over API Routes
**Decision**: Prefer Server Actions for mutations
**Rationale**:
- Automatic serialization/deserialization
- Type-safe by default
- Simpler error handling
- Progressive enhancement ready

### ADR-005: Multi-stage Docker Build
**Decision**: Use multi-stage Docker build
**Rationale**:
- Smaller production images
- Cached layer optimization
- Security (no dev dependencies)
- Consistent environments

## Extension Points

### 1. **Authentication Layer**
```typescript
// Future: app/lib/auth/middleware.ts
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return session.user;
}
```

### 2. **Theme System**
```typescript
// Implemented: app/lib/theme/provider.tsx
export const themes = {
  light: { ... },
  dark: { ... },
  custom: { ... }
};
```

### 3. **Export/Import**
```typescript
// Future: app/lib/export/service.ts
export async function exportPromptLibrary(userId: string) {
  // JSON export with schema versioning
}
```

### 4. **Multi-user Isolation**
```typescript
// Future: app/lib/db/scoped-queries.ts
export function getScopedQuery(userId: string) {
  // All queries automatically filtered by userId
}
```

## Next Steps

1. Review and approve architecture
2. Generate detailed folder structure
3. Define component hierarchy
4. Specify API contracts
5. Design database schema with migrations
6. Create Dockerfile and docker-compose.yml
7. Set up development environment

## References

- Next.js 15 Documentation: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- Zustand: https://zustand-demo.pmnd.rs
- shadCN UI: https://ui.shadcn.com
- Tailwind v4: https://tailwindcss.com
