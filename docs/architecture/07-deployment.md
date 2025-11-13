# AI Prompt Builder - Deployment Architecture

## Docker Architecture

The application uses a **multi-stage Docker build** for optimized production images.

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Generate Drizzle types and run migrations
RUN npx drizzle-kit generate:sqlite && \
    npx tsx scripts/db-migrate.ts

# Build Next.js application
RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create data directory for SQLite
RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app/data

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/lib/db/migrations ./lib/db/migrations

# Copy package.json for runtime dependencies
COPY --from=builder /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

**Multi-stage Benefits**:
- **deps**: Caches dependencies separately
- **builder**: Compiles application
- **runner**: Minimal production image (150MB vs 1.2GB)

---

### Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      cache_from:
        - ghcr.io/your-org/ai-prompt-builder:latest
    image: ai-prompt-builder:latest
    container_name: ai-prompt-builder
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      # Persist SQLite database
      - ./data:/app/data
      # Optional: Development hot-reload
      # - ./app:/app/app:ro
      # - ./components:/app/components:ro
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/app/data/app.db
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - app-network

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: ai-prompt-builder-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  data:
    driver: local
```

---

### Nginx Configuration (Optional)

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream nextjs_app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Rate limit API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://nextjs_app;
        }

        # Cache static assets
        location /_next/static/ {
            proxy_pass http://nextjs_app;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## Environment Configuration

### `.env.example`

```env
# Application
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1

# Database
DATABASE_URL=/app/data/app.db

# Security (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_EXPORT=true
```

### `.env.production`

```env
NODE_ENV=production
DATABASE_URL=/app/data/app.db
NEXT_TELEMETRY_DISABLED=1
```

---

## Deployment Workflows

### GitHub Actions CI/CD

```yaml
# .github/workflows/docker-build.yml
name: Docker Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/ai-prompt-builder
            docker-compose pull
            docker-compose up -d
            docker image prune -f
```

---

## Database Management

### Migrations

```bash
# Generate migration
npx drizzle-kit generate:sqlite

# Apply migration
npx tsx scripts/db-migrate.ts

# Seed database
npx tsx lib/db/seed.ts
```

### Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/app/backups"
DB_PATH="/app/data/app.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/app_${TIMESTAMP}.db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database (WAL mode safe)
sqlite3 $DB_PATH ".backup $BACKUP_FILE"

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "app_*.db.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Cron Job for Backups

```bash
# Add to crontab
0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

---

## Monitoring & Logging

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await db.execute('SELECT 1');

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### Docker Logging

```bash
# View logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app

# Export logs
docker-compose logs app > logs/app-$(date +%Y%m%d).log
```

### Sentry Integration (Optional)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
    }
    return event;
  },
});
```

---

## Performance Optimization

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone', // Optimized Docker builds
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default config;
```

### SQLite Optimization

```typescript
// lib/db/index.ts
import Database from 'better-sqlite3';

const sqlite = new Database(process.env.DATABASE_URL || 'data/app.db');

// Performance optimizations
sqlite.pragma('journal_mode = WAL'); // Write-Ahead Logging
sqlite.pragma('synchronous = NORMAL'); // Balance safety/performance
sqlite.pragma('cache_size = -64000'); // 64MB cache
sqlite.pragma('temp_store = MEMORY'); // Use memory for temp tables
sqlite.pragma('mmap_size = 268435456'); // 256MB memory-mapped I/O
```

---

## Scaling Strategies

### Horizontal Scaling (Future)

```yaml
# docker-compose.scale.yml
services:
  app:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  load-balancer:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
```

### Database Migration to PostgreSQL (Future)

```typescript
// For multi-instance deployments
export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run linting: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Build locally: `docker build -t ai-prompt-builder .`
- [ ] Test Docker image: `docker run -p 3000:3000 ai-prompt-builder`
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed (if using HTTPS)

### Post-Deployment

- [ ] Health check passing: `curl http://localhost:3000/api/health`
- [ ] Database accessible
- [ ] Logs showing no errors
- [ ] Performance metrics baseline
- [ ] Backup strategy verified
- [ ] Monitoring alerts configured

---

## Security Hardening

### Container Security

```dockerfile
# Run as non-root user
USER nextjs

# Read-only root filesystem
CMD ["node", "--security-mark-as-untrusted=*", "server.js"]
```

### Network Security

```yaml
# docker-compose.yml
services:
  app:
    networks:
      - internal
    expose:
      - "3000" # Don't use ports:

  nginx:
    networks:
      - internal
      - external
    ports:
      - "80:80"
      - "443:443"

networks:
  internal:
    internal: true
  external:
```

### Secrets Management

```bash
# Use Docker secrets
echo "secret_value" | docker secret create db_password -

# Reference in compose
services:
  app:
    secrets:
      - db_password
```

---

## Rollback Procedure

```bash
# 1. Tag current version
docker tag ai-prompt-builder:latest ai-prompt-builder:backup

# 2. Pull previous version
docker pull ghcr.io/your-org/ai-prompt-builder:v1.2.3

# 3. Stop current container
docker-compose down

# 4. Restore database backup
gunzip -c backups/app_20250112.db.gz > data/app.db

# 5. Start previous version
docker-compose up -d

# 6. Verify health
curl http://localhost:3000/api/health
```

---

## Cost Optimization

### Resource Limits

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Caching Strategy

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## Troubleshooting

### Common Issues

1. **Database locked**
   ```bash
   # Check WAL mode
   sqlite3 data/app.db "PRAGMA journal_mode;"

   # If needed, convert
   sqlite3 data/app.db "PRAGMA journal_mode=WAL;"
   ```

2. **Permission denied**
   ```bash
   # Fix ownership
   chown -R 1001:1001 data/
   ```

3. **Out of memory**
   ```bash
   # Increase Docker memory limit
   docker update --memory 1g ai-prompt-builder
   ```

### Debug Mode

```bash
# Run with debug logging
docker-compose run --rm -e DEBUG=* app node server.js
```

---

## Production URLs

- **Application**: https://your-domain.com
- **Health Check**: https://your-domain.com/api/health
- **Metrics** (future): https://your-domain.com/api/metrics
- **Admin Panel** (future): https://your-domain.com/admin
