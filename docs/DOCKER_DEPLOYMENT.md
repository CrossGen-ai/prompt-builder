# AI Prompt Builder - Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB free disk space
- Port 3000 available

### One-Command Deployment

```bash
# From project root
docker compose -f docker/docker-compose.yml up -d
```

Access the application at `http://localhost:3000`

## Configuration

### Environment Variables

1. **Copy the template:**
   ```bash
   cp docker/.env.sample docker/.env
   ```

2. **Edit configuration:**
   ```bash
   nano docker/.env
   ```

3. **Key settings:**
   ```env
   PORT=3000
   DATABASE_URL=file:/app/data/prompts.db
   DATA_PATH=./data
   OPENAI_API_KEY=your-key-here
   ```

### Data Persistence

Data is stored in the `docker/data` directory by default:

```bash
# Change data location
export DATA_PATH=/your/custom/path
docker compose -f docker/docker-compose.yml up -d
```

## Deployment Options

### Production Deployment

```bash
# Build and start in detached mode
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Stop containers
docker compose -f docker/docker-compose.yml down
```

### Development Deployment

```bash
# Start with hot-reload
docker compose -f docker/docker-compose.dev.yml up

# Stop development environment
docker compose -f docker/docker-compose.dev.yml down
```

### Custom Port

```bash
# Run on port 8080
PORT=8080 docker compose -f docker/docker-compose.yml up -d
```

## Database Management

### Migrations

Migrations run automatically on startup. To skip:

```bash
SKIP_MIGRATIONS=true docker compose -f docker/docker-compose.yml up -d
```

### Manual Migration

```bash
# Access container
docker exec -it ai-prompt-builder sh

# Run migrations
npx drizzle-kit push:sqlite
```

### Database Backup

```bash
# Backup SQLite database
docker exec ai-prompt-builder sqlite3 /app/data/prompts.db ".backup '/app/data/backup.db'"

# Copy to host
docker cp ai-prompt-builder:/app/data/backup.db ./backup.db
```

### Database Restore

```bash
# Copy backup to container
docker cp ./backup.db ai-prompt-builder:/app/data/prompts.db

# Restart container
docker compose -f docker/docker-compose.yml restart
```

## Monitoring

### Health Checks

```bash
# Check container health
docker inspect ai-prompt-builder --format='{{.State.Health.Status}}'

# View health check logs
docker inspect ai-prompt-builder --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# Manual health check
docker exec ai-prompt-builder /app/docker/healthcheck.sh
```

### Logs

```bash
# View all logs
docker compose -f docker/docker-compose.yml logs

# Follow logs
docker compose -f docker/docker-compose.yml logs -f

# View specific service logs
docker logs ai-prompt-builder

# Last 100 lines
docker logs ai-prompt-builder --tail 100
```

### Resource Usage

```bash
# View resource stats
docker stats ai-prompt-builder

# Detailed resource usage
docker exec ai-prompt-builder sh -c 'du -sh /app/* 2>/dev/null'
```

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker ps -a

# View startup logs
docker logs ai-prompt-builder

# Inspect container
docker inspect ai-prompt-builder
```

### Database Issues

```bash
# Verify database file
docker exec ai-prompt-builder ls -lah /app/data/

# Check database integrity
docker exec ai-prompt-builder sqlite3 /app/data/prompts.db "PRAGMA integrity_check;"

# Reset database
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

### Permission Issues

```bash
# Fix data directory permissions
sudo chown -R 1001:1001 docker/data

# Verify permissions
ls -la docker/data
```

### Network Issues

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Check port binding
docker port ai-prompt-builder

# Inspect network
docker network inspect prompt-network
```

## Advanced Usage

### Multi-Stage Build Optimization

The Dockerfile uses multi-stage builds for optimal size:

```bash
# Build with specific target
docker build -f docker/Dockerfile --target deps -t ai-prompt-builder:deps .
docker build -f docker/Dockerfile --target builder -t ai-prompt-builder:builder .
docker build -f docker/Dockerfile --target runner -t ai-prompt-builder:latest .
```

### Custom Build Args

```bash
# Build with custom Node version
docker build -f docker/Dockerfile --build-arg NODE_VERSION=20.11.0 -t ai-prompt-builder .
```

### Resource Limits

Edit `docker-compose.yml` to adjust limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'      # Increase CPU limit
      memory: 4G       # Increase memory limit
```

### Running Behind Reverse Proxy

```bash
# With Nginx
upstream prompt_builder {
    server localhost:3000;
}

server {
    listen 80;
    server_name prompt-builder.example.com;

    location / {
        proxy_pass http://prompt_builder;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Scaling

### Horizontal Scaling

```bash
# Scale to 3 instances
docker compose -f docker/docker-compose.yml up -d --scale app=3
```

**Note:** Requires shared database setup (not SQLite).

### Load Balancing

Use Docker Swarm or Kubernetes for production load balancing.

## Security Best Practices

1. **Never commit `.env` files**
2. **Use Docker secrets for sensitive data**
3. **Run containers as non-root user** (already configured)
4. **Keep base images updated:**
   ```bash
   docker compose -f docker/docker-compose.yml pull
   docker compose -f docker/docker-compose.yml up -d
   ```
5. **Scan for vulnerabilities:**
   ```bash
   docker scan ai-prompt-builder
   ```

## Cleanup

### Remove Containers

```bash
# Stop and remove containers
docker compose -f docker/docker-compose.yml down

# Remove with volumes
docker compose -f docker/docker-compose.yml down -v

# Remove images
docker rmi ai-prompt-builder
```

### Free Disk Space

```bash
# Remove dangling images
docker image prune

# Remove unused containers
docker container prune

# Full cleanup
docker system prune -a
```

## Production Checklist

- [ ] Configure `.env` file with production settings
- [ ] Set up data volume backups
- [ ] Configure reverse proxy (Nginx/Traefik)
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Test disaster recovery procedures
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline
- [ ] Configure firewall rules

## Support

For issues and questions:
- Check logs: `docker logs ai-prompt-builder`
- Review health checks: `docker inspect ai-prompt-builder`
- Consult Docker documentation: https://docs.docker.com
