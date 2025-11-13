# 🚀 Quick Start - Run on Port 3322

## Problem
- Node.js v24.10.0 has C++20 requirements that break `better-sqlite3` native compilation
- The cleanest solution is to use Docker which has everything pre-configured

## ✅ Solution: Run with Docker (Port 3322)

### 1. Start Docker Desktop
```bash
open -a Docker
# Wait ~30 seconds for Docker to start
```

### 2. Start the Development Server
```bash
cd /Users/seanpatterson/Memory

# Start on port 3322 (configured already!)
PORT=3322 docker compose -f docker/docker-compose.yml up -d
```

### 3. Access the Application
```bash
open http://localhost:3322
```

### 4. View Logs (Optional)
```bash
docker compose -f docker/docker-compose.yml logs -f
```

### 5. Stop the Server
```bash
docker compose -f docker/docker-compose.yml down
```

---

## 🔄 Alternative: Use Node LTS (v20.x) for Native Development

If you prefer running without Docker:

### 1. Install Node v20.x (LTS)
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or using Homebrew
brew install node@20
brew link node@20
```

### 2. Clean and Reinstall Dependencies
```bash
cd /Users/seanpatterson/Memory/app
rm -rf node_modules package-lock.json
npm install
```

### 3. Set up Environment
```bash
# Copy template
cp .env.sample .env.local

# Edit .env.local to ensure PORT=3322
```

### 4. Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Dev Server
```bash
npm run dev
# Opens on http://localhost:3322
```

---

## 📋 Current Configuration

✅ Port configured: **3322**
✅ Database: SQLite at `/data/prompts.db`
✅ Hot reload: Enabled
✅ Environment: `.env.sample` template created

---

## 🎯 Recommended Approach

**Use Docker** - It's already configured, avoids native compilation issues, and works identically to production!

```bash
# One command to rule them all:
PORT=3322 docker compose -f docker/docker-compose.yml up -d
```

Then visit: **http://localhost:3322**
