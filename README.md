# Memory - AI Prompt Manager

A modern, production-ready full-stack application for building, managing, and organizing AI prompts with a clean interface and persistent storage.

## Features

- **Dynamic Prompt Building**: Create prompts by selecting fragments from organized categories
- **Category Management**: Organize prompt fragments into collapsible categories
- **Custom Prompts**: Add custom text sections with toggle enable/disable
- **Live Preview**: Real-time compiled prompt preview as you select fragments
- **Persistent Storage**: SQLite database with Drizzle ORM for reliable data persistence
- **Modern UI**: Built with Next.js 15, React 19, and shadCN UI components
- **Type Safety**: Full TypeScript support with strict mode enabled
- **State Management**: Zustand for predictable and performant state updates
- **Docker Ready**: One-command deployment with Docker Compose
- **Production Optimized**: Multi-stage Docker builds, health checks, and resource limits

## Tech Stack

### Frontend
- **Next.js 15** - App Router with server components
- **React 19** - Latest React features and concurrent rendering
- **TypeScript** - Strict type checking for reliability
- **Tailwind CSS v4** - Utility-first styling with JIT compiler
- **shadCN UI** - High-quality accessible components
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon library

### Backend
- **SQLite** - Embedded database for zero-config persistence
- **Drizzle ORM** - Type-safe SQL query builder
- **Next.js API Routes** - RESTful API endpoints

### DevOps
- **Docker** - Containerization with multi-stage builds
- **Docker Compose** - Simple orchestration
- **Nginx** - Reverse proxy and static file serving

## Prerequisites

- **Node.js 20+** or **Docker 20.10+**
- **npm 9+** or **yarn 1.22+**
- **Docker Compose 2.0+** (for Docker deployment)

## Quick Start

### Option 1: Docker Deployment (Recommended)

One command to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd Memory

# Start with Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Access the application
open http://localhost:3000
```

The application will be running with:
- Frontend: http://localhost:3000
- Database: Persisted in `docker/data/memory.db`
- Health checks: Automatic container monitoring

**Detailed Docker documentation**: See [docker/README.md](docker/README.md)

### Option 2: Local Development

```bash
# 1. Install dependencies
cd app
npm install

# 2. Set up environment variables
cp .env.example .env
nano .env  # Edit with your configuration

# 3. Initialize database
npm run db:migrate
npm run db:seed  # Optional: Load sample data

# 4. Start development server
npm run dev

# 5. Access the application
open http://localhost:3000
```

## Project Structure

```
Memory/
├── app/                          # Next.js frontend application
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # React components
│   │   ├── ui/                   # shadCN UI components
│   │   ├── CategoryList.tsx      # Category display
│   │   ├── FragmentSelector.tsx  # Fragment selection
│   │   └── PromptPreview.tsx     # Live prompt preview
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   ├── store.ts              # Zustand store
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Helper functions
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   └── tsconfig.json             # TypeScript config
├── backend/                      # Backend services
│   ├── api/                      # API endpoints
│   ├── db/                       # Database configuration
│   ├── migrations/               # Database migrations
│   ├── scripts/                  # Utility scripts
│   └── types/                    # Shared types
├── docker/                       # Docker configuration
│   ├── Dockerfile                # Multi-stage build
│   ├── docker-compose.yml        # Orchestration
│   ├── nginx.conf                # Nginx config
│   ├── .env.sample               # Environment template
│   └── README.md                 # Docker documentation
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── DEVELOPMENT.md            # Development guide
│   └── API.md                    # API documentation
├── .claude/                      # Claude AI configuration
├── .hive-mind/                   # Agent coordination
├── coordination/                 # Swarm coordination
├── memory/                       # Persistent memory
├── logs/                         # Application logs
├── CLAUDE.md                     # Development instructions
├── .gitignore                    # Git ignore rules
├── .mcp.json                     # MCP server config
└── README.md                     # This file
```

## Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Memory
   ```

2. **Install frontend dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Set up database**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: Sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Navigate to Docker directory**
   ```bash
   cd docker
   ```

2. **Configure environment**
   ```bash
   cp .env.sample .env
   nano .env  # Update with secure values
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f app
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

## Available Scripts

### Frontend (app/)

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Docker

```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f            # View logs
docker-compose ps                 # Check status
docker-compose exec app sh        # Access container shell
docker-compose restart            # Restart services
```

## API Documentation

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Fragments

- `GET /api/fragments` - List all fragments
- `GET /api/fragments/:id` - Get fragment by ID
- `GET /api/fragments?categoryId=:id` - Get fragments by category
- `POST /api/fragments` - Create new fragment
- `PUT /api/fragments/:id` - Update fragment
- `DELETE /api/fragments/:id` - Delete fragment

### Prompts

- `POST /api/compile` - Compile selected fragments into prompt

**Detailed API documentation**: See [docs/API.md](docs/API.md)

## Database Schema

```sql
-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Prompt fragments table
CREATE TABLE prompt_fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category_id TEXT NOT NULL,
  order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_fragments_category ON prompt_fragments(category_id);
CREATE INDEX idx_categories_order ON categories(order);
CREATE INDEX idx_fragments_order ON prompt_fragments(order);
```

## Configuration

### Environment Variables

Create `.env` file in the `app/` directory:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=file:../data/memory.db

# API
API_BASE_URL=http://localhost:3000/api

# Security (Production only)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production
```

**Important**: Never commit `.env` files. Use `.env.example` as a template.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Database Migration Issues

```bash
# Reset database
rm -rf data/memory.db

# Rerun migrations
npm run db:migrate
npm run db:seed
```

### Docker Issues

```bash
# Check logs
docker-compose logs -f app

# Rebuild container
docker-compose down
docker-compose up -d --build

# Check container health
docker inspect nextjs-memory-app | grep -A 10 Health
```

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf app/.next

# Reinstall dependencies
rm -rf app/node_modules
cd app && npm install
```

## Performance

- **Multi-stage Docker builds**: ~150MB final image (vs 1GB+ without optimization)
- **SQLite with indexes**: Fast queries even with 10,000+ fragments
- **Zustand state management**: Minimal re-renders and optimal performance
- **Next.js 15**: Server components and streaming for faster loads
- **Tailwind JIT**: On-demand CSS generation for smaller bundles

## Security

- **Strict TypeScript**: Catch errors at compile time
- **Input validation**: All API inputs validated
- **SQL injection prevention**: Drizzle ORM parameterized queries
- **XSS protection**: React automatic escaping
- **Non-root Docker user**: Container runs as UID 1001
- **Health checks**: Automatic container monitoring
- **Environment secrets**: Never hardcode credentials

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Workflow

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guidelines on:
- Code style guide
- Testing procedures
- Git workflow
- CI/CD pipeline
- Release process

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed information on:
- System architecture diagrams
- Component hierarchy
- State management flow
- Database design
- API design patterns

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Docker Guide**: [docker/README.md](docker/README.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- UI components from [shadCN UI](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Database ORM by [Drizzle](https://orm.drizzle.team/)

---

**Memory** - Build better prompts, faster.
