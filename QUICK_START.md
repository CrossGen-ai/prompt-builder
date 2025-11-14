# 🚀 Quick Start - Memory Prompt Builder

Get up and running in 5 minutes with local development or deploy to production with one click.

## ⚡ Fastest Start - Vercel Deployment

Perfect for production or testing the live app:

### 1. Fork & Import
1. Fork the repository on GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your forked repository
4. Set **Root Directory** to `app`

### 2. Configure Database
1. Create free database at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add to Vercel environment variables:
   ```
   DATABASE_URL=postgresql://...
   ```

### 3. Set Auth Secret
Generate and add:
```bash
AUTH_SECRET=$(openssl rand -base64 32)  # Generate locally
```

Add to Vercel:
```
AUTH_SECRET=your-generated-secret
```

### 4. Deploy!
- Click "Deploy"
- Wait ~2 minutes
- Your app is live! 🎉

### 5. Add Production URL
After deployment, add final environment variable:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

Redeploy for changes to take effect.

---

## 💻 Local Development

Perfect for development and customization:

### Prerequisites
- Node.js 20+ (LTS)
- npm 9+
- Neon database account (free)

### 1. Clone Repository
```bash
git clone https://github.com/CrossGen-ai/prompt-builder.git
cd Memory/app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
# Create environment file
cp .env.example .env.local

# Edit with your configuration
nano .env.local
```

Required environment variables:
```bash
# Neon Postgres Connection
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secure-random-string"

# Local development URL
NEXTAUTH_URL="http://localhost:3322"
```

### 4. Run Database Migrations
```bash
npm run db:migrate
```

### 5. (Optional) Seed Sample Data
```bash
npm run db:seed
```

### 6. Start Dev Server
```bash
npm run dev
```

### 7. Open in Browser
```bash
open http://localhost:3322
```

---

## 🔧 Development Workflow

### Daily Development
```bash
cd Memory/app
npm run dev
```

### Making Database Changes
```bash
# 1. Edit app/db/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate

# 4. View database
npm run db:studio
```

### Testing Your Changes
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:coverage
```

### Building for Production
```bash
# Test production build locally
npm run build

# Start production server
npm start
```

---

## 🎯 What's Running

When you start the dev server, you get:

✅ **Next.js 16** - Latest with Turbopack (5x faster)
✅ **Hot Module Reload** - Instant updates as you code
✅ **TypeScript** - Full type checking
✅ **Tailwind JIT** - On-demand CSS compilation
✅ **NextAuth** - Email/password authentication
✅ **Neon Postgres** - Cloud database with auto-scaling
✅ **Dark Mode** - System-aware theme switching

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 3322
lsof -i :3322

# Kill it
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### Database Connection Issues
```bash
# Check your DATABASE_URL format
echo $DATABASE_URL

# Should look like:
# postgresql://user:password@ep-xxx.region.neon.tech/database?sslmode=require

# Test connection
npm run db:studio
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Authentication Not Working
```bash
# Verify environment variables are set
cat .env.local | grep AUTH_SECRET
cat .env.local | grep NEXTAUTH_URL

# Ensure AUTH_SECRET is a random string (not example text)
# Ensure NEXTAUTH_URL matches your actual URL
```

---

## 📋 Environment Checklist

Before starting development, ensure:

- [x] Node.js 20+ installed
- [x] Neon database created
- [x] DATABASE_URL copied to .env.local
- [x] AUTH_SECRET generated and added
- [x] NEXTAUTH_URL set correctly
- [x] Dependencies installed (`npm install`)
- [x] Migrations run (`npm run db:migrate`)

---

## 🚢 Deploying Changes

### To Vercel (Automatic)
```bash
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically deploys!
# Check dashboard for build status
```

### Testing Locally First
```bash
# Always test the build before pushing
npm run build

# If successful, deploy:
git push origin main
```

---

## 🔗 Useful Links

- **Local App**: http://localhost:3322
- **Database Studio**: `npm run db:studio`
- **Neon Dashboard**: https://console.neon.tech
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/CrossGen-ai/prompt-builder

---

## 💡 Pro Tips

1. **Use Database Studio**: `npm run db:studio` opens a GUI for your database
2. **Watch Tests**: Keep `npm run test:watch` running while coding
3. **Check Logs**: Vercel dashboard shows real-time function logs
4. **Hot Reload**: Changes appear instantly - no manual refresh
5. **Type Safety**: TypeScript catches errors before runtime

---

## 🎓 Next Steps

Now that you're running:

1. **Register an account** at http://localhost:3322
2. **Create categories** to organize prompts
3. **Add sections** with prompt fragments
4. **Select sections** to build your prompt
5. **Copy to clipboard** and use in your AI tools

For more details, see the [full README](README.md).

---

**Memory** - Build better AI prompts, faster. 🚀
