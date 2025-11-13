# Development Guide

This guide covers development workflow, coding standards, testing procedures, and contribution guidelines for the Memory project.

## Table of Contents

- [Development Setup](#development-setup)
- [Workflow](#workflow)
- [Code Style Guide](#code-style-guide)
- [Testing Guidelines](#testing-guidelines)
- [Git Workflow](#git-workflow)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

- **Node.js 20.x** or higher
- **npm 9.x** or higher
- **Git 2.40+**
- **Docker 20.10+** (optional, for containerized development)
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Memory
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Update values as needed
   ```

4. **Initialize database**
   ```bash
   npm run db:migrate
   npm run db:seed  # Load sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

### Development Environment Variables

```bash
# .env (development)
NODE_ENV=development
PORT=3000
DATABASE_URL=file:../data/memory.db
API_BASE_URL=http://localhost:3000/api

# Optional: Enable development features
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_SHOW_GRID=false
```

## Workflow

### Daily Development Workflow

1. **Start of day**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Development cycle**
   ```bash
   # Make changes
   npm run dev          # Run dev server
   npm run typecheck    # Check types
   npm run lint         # Check linting
   npm run test         # Run tests
   ```

3. **Before commit**
   ```bash
   npm run build        # Ensure production build works
   npm run typecheck    # Final type check
   npm run lint -- --fix  # Auto-fix linting issues
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

5. **Create pull request**
   - Open PR on GitHub
   - Request review
   - Address feedback
   - Merge when approved

### Hot Module Replacement (HMR)

Next.js 15 provides fast refresh:
- Changes to components update instantly
- State is preserved during updates
- No full page reload needed

```typescript
// Component will hot reload on save
export default function MyComponent() {
  const [count, setCount] = useState(0)
  // Changes here update instantly
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### SPARC Development Methodology

This project uses SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) for complex features:

```bash
# 1. Specification - Define requirements
npx claude-flow sparc run spec-pseudocode "User authentication system"

# 2. Pseudocode - Design algorithm
npx claude-flow sparc run pseudocode "Auth flow logic"

# 3. Architecture - System design
npx claude-flow sparc run architect "Auth architecture"

# 4. Refinement - TDD implementation
npx claude-flow sparc tdd "Implement auth endpoints"

# 5. Completion - Integration
npx claude-flow sparc run integration "Integrate auth with UI"
```

## Code Style Guide

### TypeScript Standards

**1. Use strict types**
```typescript
// ✅ Good: Explicit types
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad: Any types
function getUser(id: any): any {
  // ...
}
```

**2. Prefer interfaces over types**
```typescript
// ✅ Good: Interface for objects
interface Category {
  id: string
  name: string
}

// ✅ Good: Type for unions
type Status = 'active' | 'inactive' | 'pending'

// ❌ Bad: Type for objects
type Category = {
  id: string
  name: string
}
```

**3. Use const assertions**
```typescript
// ✅ Good: Const assertion
const STATUSES = ['active', 'inactive', 'pending'] as const
type Status = typeof STATUSES[number]

// ❌ Bad: Mutable array
const STATUSES = ['active', 'inactive', 'pending']
```

### React Best Practices

**1. Component structure**
```typescript
// ✅ Good: Clear component structure
interface Props {
  title: string
  onSubmit: (data: FormData) => void
}

export function MyComponent({ title, onSubmit }: Props) {
  // 1. Hooks at top
  const [value, setValue] = useState('')
  const store = usePromptStore()

  // 2. Event handlers
  const handleSubmit = useCallback(() => {
    onSubmit({ value })
  }, [value, onSubmit])

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 4. Render
  return <div>{title}</div>
}
```

**2. Prop drilling vs Context**
```typescript
// ✅ Good: Use Zustand for global state
const categories = usePromptStore(state => state.categories)

// ❌ Bad: Prop drilling 5+ levels
<A>
  <B categories={categories}>
    <C categories={categories}>
      <D categories={categories}>
        <E categories={categories} />
      </D>
    </C>
  </B>
</A>
```

**3. Component naming**
```typescript
// ✅ Good: PascalCase for components
function CategoryList() {}
function UserProfile() {}

// ❌ Bad: camelCase for components
function categoryList() {}
function userProfile() {}
```

### File Organization

```
app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (kebab-case)
│   ├── (auth)/            # Route groups
│   ├── layout.tsx         # Layouts
│   └── page.tsx           # Pages
├── components/            # React components (PascalCase)
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   ├── CategoryList.tsx  # Feature components
│   └── PromptPreview.tsx
├── lib/                  # Utilities (camelCase)
│   ├── api.ts           # API client
│   ├── store.ts         # State management
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
└── styles/              # Global styles
    └── globals.css
```

### Naming Conventions

```typescript
// Components: PascalCase
CategoryList.tsx
PromptPreview.tsx

// Functions: camelCase
getUserById()
formatDate()
calculateTotal()

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'http://localhost:3000'

// Types/Interfaces: PascalCase
interface User {}
type Status = 'active' | 'inactive'

// Files: kebab-case (API routes) or PascalCase (components)
api/user-profile/route.ts
components/UserProfile.tsx
```

### Import Organization

```typescript
// 1. External packages
import React from 'react'
import { useCallback, useState } from 'react'
import { create } from 'zustand'

// 2. Internal absolute imports
import { Button } from '@/components/ui/button'
import { usePromptStore } from '@/lib/store'
import type { Category } from '@/lib/types'

// 3. Relative imports
import { formatDate } from './utils'
import styles from './Component.module.css'
```

## Testing Guidelines

### Test Structure

```typescript
// CategoryList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryList } from './CategoryList'

describe('CategoryList', () => {
  // Setup
  beforeEach(() => {
    // Reset state, mocks, etc.
  })

  // Test cases grouped by feature
  describe('rendering', () => {
    it('should render all categories', () => {
      // Arrange
      const categories = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' }
      ]

      // Act
      render(<CategoryList categories={categories} />)

      // Assert
      expect(screen.getByText('Category 1')).toBeInTheDocument()
      expect(screen.getByText('Category 2')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should toggle category when clicked', () => {
      // Test user interactions
    })
  })
})
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Core functionality

```bash
# Run tests
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
```

### Writing Good Tests

**1. Test behavior, not implementation**
```typescript
// ✅ Good: Test user behavior
it('should show error when category name is empty', () => {
  render(<CreateCategoryForm />)
  fireEvent.click(screen.getByText('Submit'))
  expect(screen.getByText('Name is required')).toBeInTheDocument()
})

// ❌ Bad: Test implementation details
it('should call validateName function', () => {
  const spy = jest.spyOn(validator, 'validateName')
  // ... test internal function call
})
```

**2. Use descriptive test names**
```typescript
// ✅ Good: Clear what is being tested
it('should display error message when API returns 404')
it('should disable submit button when form is invalid')

// ❌ Bad: Vague test names
it('should work')
it('test error handling')
```

**3. Avoid test interdependence**
```typescript
// ✅ Good: Independent tests
describe('UserProfile', () => {
  beforeEach(() => {
    // Fresh setup for each test
    renderWithUser({ id: '1', name: 'John' })
  })

  it('should display user name', () => {
    // Test standalone
  })

  it('should update user on edit', () => {
    // Test standalone
  })
})

// ❌ Bad: Tests depend on each other
it('should create user', () => {
  createdUser = createUser()
})

it('should update created user', () => {
  updateUser(createdUser.id)  // Depends on previous test
})
```

## Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/prompt-sharing

# Bug fixes
git checkout -b fix/category-delete-error
git checkout -b fix/mobile-layout

# Hotfixes
git checkout -b hotfix/security-patch

# Refactoring
git checkout -b refactor/api-client

# Documentation
git checkout -b docs/api-documentation
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat:      New feature
fix:       Bug fix
docs:      Documentation changes
style:     Code style changes (formatting)
refactor:  Code refactoring
test:      Adding tests
chore:     Build process, dependencies

# Examples
feat(auth): add user authentication
fix(api): resolve category deletion error
docs(readme): update installation instructions
refactor(store): simplify state management
test(fragments): add fragment selection tests
chore(deps): upgrade Next.js to v15
```

### Pull Request Process

1. **Create PR with template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] No console errors

   ## Screenshots
   (if applicable)

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No merge conflicts
   ```

2. **Review process**
   - At least one approval required
   - All CI checks must pass
   - No merge conflicts
   - Up to date with main branch

3. **Merge strategy**
   - Use "Squash and merge" for feature branches
   - Use "Rebase and merge" for hotfixes
   - Delete branch after merge

## Deployment Process

### Development Deployment

```bash
# Build and test locally
npm run build
npm run start

# Test production build locally
docker-compose -f docker/docker-compose.yml up --build

# Check for issues
docker-compose logs -f app
```

### Production Deployment

1. **Pre-deployment checklist**
   - [ ] All tests passing
   - [ ] No TypeScript errors
   - [ ] No console warnings
   - [ ] Environment variables configured
   - [ ] Database migrations ready
   - [ ] Backup created

2. **Deploy with Docker**
   ```bash
   # Pull latest code
   git pull origin main

   # Build production image
   docker-compose -f docker/docker-compose.yml build

   # Stop old containers
   docker-compose -f docker/docker-compose.yml down

   # Start new containers
   docker-compose -f docker/docker-compose.yml up -d

   # Check health
   docker-compose -f docker/docker-compose.yml ps
   docker-compose -f docker/docker-compose.yml logs -f app
   ```

3. **Verify deployment**
   ```bash
   # Health check
   curl http://localhost:3000/api/health

   # Check logs
   docker-compose logs -f --tail=100

   # Monitor resources
   docker stats
   ```

4. **Rollback if needed**
   ```bash
   # Revert to previous image
   docker-compose down
   docker-compose up -d <previous-image-tag>

   # Or restore from backup
   docker cp ./backups/memory.db nextjs-memory-app:/app/data/memory.db
   docker-compose restart
   ```

### Database Migrations

```bash
# Create migration
npm run db:generate

# Apply migration (development)
npm run db:migrate

# Production migration
docker-compose exec app npm run db:migrate

# Rollback migration (if needed)
npm run db:rollback
```

### Monitoring

```bash
# Application logs
docker-compose logs -f app

# Resource usage
docker stats nextjs-memory-app

# Database size
docker-compose exec app ls -lh /app/data/memory.db

# Health status
curl http://localhost:3000/api/health
```

## Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**2. Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

**3. TypeScript errors**
```bash
# Rebuild TypeScript
npm run typecheck

# Clear and rebuild
rm -rf .next
npm run build
```

**4. Database locked**
```bash
# Check for processes using database
lsof | grep memory.db

# Close all connections and restart
docker-compose restart app
```

**5. Docker issues**
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Check container logs
docker-compose logs -f app
```

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm run dev

# Next.js debug
NODE_OPTIONS='--inspect' npm run dev

# Database debug
DEBUG=drizzle:* npm run dev
```

### Performance Profiling

```bash
# React DevTools Profiler
npm install -g react-devtools

# Next.js build analysis
npm run build -- --profile

# Bundle analyzer
npm install -D @next/bundle-analyzer
```

## Best Practices Summary

1. **Always** run type checking before committing
2. **Never** commit directly to main
3. **Always** write tests for new features
4. **Never** hardcode secrets or credentials
5. **Always** update documentation when changing APIs
6. **Never** use `any` type in TypeScript
7. **Always** test production builds locally before deploying
8. **Never** skip code reviews
9. **Always** follow naming conventions
10. **Never** commit node_modules or .env files

---

**Happy coding!** If you have questions, check the documentation or open an issue.
