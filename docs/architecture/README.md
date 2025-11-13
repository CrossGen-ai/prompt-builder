# AI Prompt Builder - Architecture Documentation

This directory contains the complete system architecture for the AI Prompt Builder application.

## Documents

1. **[01-system-overview.md](./01-system-overview.md)** - High-level architecture, technology stack, and design principles
2. **[02-folder-structure.md](./02-folder-structure.md)** - Complete project structure and organization
3. **[03-component-architecture.md](./03-component-architecture.md)** - Component hierarchy, props, and interactions
4. **[04-api-specification.md](./04-api-specification.md)** - Server Actions and Route Handler specifications
5. **[05-database-schema.md](./05-database-schema.md)** - Database design with Drizzle ORM
6. **[06-state-management.md](./06-state-management.md)** - Zustand stores and state patterns
7. **[07-deployment.md](./07-deployment.md)** - Docker deployment and production setup

## Quick Reference

### Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind v4, shadCN UI
- **State**: Zustand with persistence
- **Backend**: Server Actions + Route Handlers
- **Database**: SQLite with Drizzle ORM
- **Deployment**: Docker multi-stage builds

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 15 App Router | Server Components, better performance, modern patterns |
| SQLite + Drizzle | Simple deployment, excellent TypeScript support, easy migration |
| Zustand | Minimal boilerplate, excellent DX, no provider wrapping |
| Server Actions | Type-safe, automatic serialization, progressive enhancement |
| Docker Multi-stage | Smaller images (150MB), faster builds, security |

### Core Principles

1. **Type Safety**: End-to-end TypeScript with Drizzle and Zod
2. **Performance**: Server Components by default, optimistic updates
3. **Maintainability**: Clear separation of concerns, modular architecture
4. **Scalability**: Plugin-ready for auth, themes, export/import
5. **Developer Experience**: Consistent patterns, comprehensive documentation

## Database Schema

```
categories (1) ──→ (N) sections (1) ──→ (N) selected_sections

custom_prompt (singleton table)
```

## Data Flow

```
User Action → Zustand Store (optimistic) → Server Action → Database
→ Revalidation → Store Update → UI Refresh
```

## File Organization

```
app/                    # Next.js routes and actions
components/            # React components (UI, features, modals)
lib/
├── db/                # Database client and schema
├── repositories/      # Data access layer
├── services/          # Business logic
├── stores/            # Zustand state management
├── hooks/             # Custom React hooks
└── validations/       # Zod schemas
```

## API Strategy

- **Mutations**: Server Actions (type-safe, automatic revalidation)
- **Queries**: Route Handlers (RESTful, cacheable)
- **Real-time**: Zustand stores with optimistic updates

## Deployment

```bash
# Build Docker image
docker build -t ai-prompt-builder .

# Run with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

## Extension Points

### Planned Features
- [ ] User authentication (NextAuth.js ready)
- [ ] Theme switching (system in place)
- [ ] Export/import functionality (service layer ready)
- [ ] Multi-user prompt libraries (database migration planned)

### Migration Paths
- **SQLite → PostgreSQL**: Update Drizzle config, no code changes
- **Single-user → Multi-user**: Add user_id columns, authentication middleware
- **Zustand → TanStack Query**: Gradual migration, stores remain as cache

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Time to Interactive | < 2s | TBD |
| Largest Contentful Paint | < 1.5s | TBD |
| Database Query Time | < 10ms | TBD |
| API Response Time (p95) | < 100ms | TBD |

## Development Workflow

1. Read architecture docs (this directory)
2. Set up development environment
3. Run database migrations
4. Seed database with test data
5. Start development server
6. Build features following established patterns

## Testing Strategy

- **Unit**: Services, repositories, utilities
- **Integration**: API routes, server actions
- **E2E**: Critical user workflows (Playwright)

## Documentation Standards

Each architecture document follows this structure:
1. Overview and purpose
2. Detailed specifications
3. Code examples
4. Best practices
5. Testing approach
6. Future considerations

## Questions?

For implementation questions, refer to:
- Component patterns → `03-component-architecture.md`
- Database queries → `05-database-schema.md`
- API design → `04-api-specification.md`
- Deployment → `07-deployment.md`

## Next Steps

1. ✅ Architecture design complete
2. ⏭️ Generate initial project scaffold
3. ⏭️ Implement database schema and migrations
4. ⏭️ Build core components
5. ⏭️ Set up Docker deployment
6. ⏭️ Write tests
7. ⏭️ Deploy to production

---

**Last Updated**: 2025-01-12
**Version**: 1.0.0
**Status**: Complete - Ready for Implementation
