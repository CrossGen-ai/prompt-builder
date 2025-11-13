# Docker Deployment Guide

This directory contains Docker configuration files for deploying the Next.js Memory application in production.

## 📁 Files Overview

- `Dockerfile` - Multi-stage production-optimized build
- `docker-compose.yml` - Complete orchestration with SQLite volume
- `.dockerignore` - Build optimization (excludes unnecessary files)
- `.env.example` - Environment variable template

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### 1. Setup Environment Variables

```bash
# Copy example environment file
cp docker/.env.example docker/.env

# Edit with your secure values
nano docker/.env
```

**⚠️ IMPORTANT**: Change `JWT_SECRET` and `SESSION_SECRET` to secure random strings!

### 2. Build and Run

```bash
# Navigate to docker directory
cd docker

# Create data directory for SQLite
mkdir -p data

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 3. Verify Deployment

```bash
# Check container status
docker-compose ps

# Test application
curl http://localhost:3000/api/health

# Access application
open http://localhost:3000
```

## 🛠️ Docker Commands

### Build Commands

```bash
# Build image without cache
docker-compose build --no-cache

# Build with specific tag
docker build -f docker/Dockerfile -t memory-app:v1.0.0 .

# Build for production
docker build --target runner -f docker/Dockerfile -t memory-app:production .
```

### Run Commands

```bash
# Start services in detached mode
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Start specific service
docker-compose up app

# Scale services (if needed)
docker-compose up -d --scale app=3
```

### Management Commands

```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
docker-compose logs -f --tail=100 app
```

### Maintenance Commands

```bash
# Execute command in running container
docker-compose exec app sh

# Check database
docker-compose exec app ls -la /app/data

# Backup database
docker-compose exec app cp /app/data/memory.db /app/data/backup-$(date +%Y%m%d).db

# Clean up unused resources
docker system prune -a
```

## 📊 Resource Configuration

Current limits (adjust in `docker-compose.yml`):

- **CPU Limit**: 2.0 cores
- **Memory Limit**: 2GB
- **CPU Reservation**: 0.5 cores
- **Memory Reservation**: 512MB

### Adjust for Your Server

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Increase for more CPU
      memory: 4G       # Increase for more RAM
    reservations:
      cpus: '1.0'
      memory: 1G
```

## 💾 Data Persistence

### SQLite Database

Location: `./data/memory.db` (mounted as volume)

```bash
# Backup database
docker-compose exec app sqlite3 /app/data/memory.db ".backup '/app/data/backup.db'"

# Copy backup to host
docker cp nextjs-memory-app:/app/data/backup.db ./backups/

# Restore database
docker cp ./backups/memory.db nextjs-memory-app:/app/data/memory.db
docker-compose restart app
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect docker_sqlite-data

# Backup volume
docker run --rm -v docker_sqlite-data:/data -v $(pwd):/backup alpine tar czf /backup/sqlite-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v docker_sqlite-data:/data -v $(pwd):/backup alpine tar xzf /backup/sqlite-backup.tar.gz -C /data
```

## 🔒 Security Best Practices

### 1. Environment Variables

Never commit `.env` file:

```bash
# Add to .gitignore
echo "docker/.env" >> .gitignore
```

### 2. Secrets Management

Use Docker secrets for production:

```yaml
secrets:
  jwt_secret:
    external: true
  session_secret:
    external: true

services:
  app:
    secrets:
      - jwt_secret
      - session_secret
```

### 3. Network Security

```bash
# Use internal network for services
networks:
  app-network:
    driver: bridge
    internal: true  # No external access
```

### 4. Non-Root User

The Dockerfile already runs as non-root user `nextjs` (UID 1001).

## 🏗️ Multi-Stage Build Benefits

1. **Dependencies Stage**: Installs production dependencies
2. **Builder Stage**: Compiles Next.js application
3. **Runner Stage**: Minimal production image

**Size Optimization**: Final image ~150MB (vs 1GB+ without multi-stage)

## 📈 Performance Optimization

### Enable Next.js Standalone Output

Add to `next.config.js`:

```javascript
module.exports = {
  output: 'standalone',
  // ... other config
}
```

### Enable Compression

```yaml
environment:
  - COMPRESS=true
  - GZIP_LEVEL=6
```

### Database Optimization

```bash
# Run VACUUM on SQLite periodically
docker-compose exec app sqlite3 /app/data/memory.db "VACUUM;"

# Analyze database
docker-compose exec app sqlite3 /app/data/memory.db "ANALYZE;"
```

## 🔍 Monitoring & Logging

### View Logs

```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs -f --tail=100

# Specific service
docker-compose logs -f app

# Export logs
docker-compose logs --no-color > app-logs.txt
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' nextjs-memory-app

# View health check logs
docker inspect --format='{{json .State.Health}}' nextjs-memory-app | jq
```

### Resource Usage

```bash
# Real-time stats
docker stats nextjs-memory-app

# Container processes
docker-compose top
```

## 🚀 Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml memory-app

# List services
docker service ls

# Scale service
docker service scale memory-app_app=3
```

### Using Kubernetes

Convert to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.0/kompose-linux-amd64 -o kompose

# Convert docker-compose to k8s
kompose convert -f docker-compose.yml
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Inspect container
docker inspect nextjs-memory-app

# Check if port is in use
lsof -i :3000
```

### Database Issues

```bash
# Check database file
docker-compose exec app ls -lh /app/data/

# Test database connection
docker-compose exec app sqlite3 /app/data/memory.db "SELECT 1;"

# Check permissions
docker-compose exec app id
docker-compose exec app ls -la /app/data/
```

### Memory Issues

```bash
# Check memory usage
docker stats --no-stream nextjs-memory-app

# Increase memory limit
# Edit docker-compose.yml and increase limits.memory
```

### Network Issues

```bash
# Check networks
docker network ls

# Inspect network
docker network inspect docker_app-network

# Test connectivity
docker-compose exec app ping -c 3 google.com
```

## 📝 Next Steps

1. Set up reverse proxy (Nginx/Traefik)
2. Configure SSL/TLS certificates
3. Implement automated backups
4. Set up monitoring (Prometheus/Grafana)
5. Configure CI/CD pipeline
6. Implement log aggregation (ELK stack)

## 🔗 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [SQLite Docker Best Practices](https://www.sqlite.org/docker.html)
