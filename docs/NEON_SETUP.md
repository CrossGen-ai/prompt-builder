# Neon Database & Authentication Setup Guide

This guide will walk you through migrating from SQLite to Neon Postgres and adding authentication to your Prompt Builder app.

## Prerequisites

- A Neon account (free tier available at [console.neon.tech](https://console.neon.tech))
- Node.js and npm installed

## Step 1: Create Neon Database

1. Visit [console.neon.tech](https://console.neon.tech) and sign in or create an account
2. Click "Create Project"
3. Choose a project name (e.g., "prompt-builder")
4. Select a region closest to your users
5. Click "Create Project"

## Step 2: Get Your Database Connection String

1. In your Neon project dashboard, click "Connection Details"
2. **IMPORTANT**: Toggle to show the **direct** (non-pooled) connection string
   - Look for a dropdown that says "Pooled connection" and switch it to "Direct connection"
   - The URL should NOT contain `.pooler.` in it
3. Copy the connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Step 3: Configure Environment Variables

1. Copy the `.env.sample` file to `.env`:
   ```bash
   cd app
   cp .env.sample .env
   ```

2. Edit `app/.env` and replace the `DATABASE_URL` placeholder:
   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Step 4: Generate and Run Migrations

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Generate new Postgres migrations:
   ```bash
   npm run db:generate
   ```

3. Run migrations on your Neon database:
   ```bash
   npm run db:migrate
   ```

4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

## Step 5: Install Neon Auth

1. From the `app` directory, run the Neon Auth installer:
   ```bash
   npx @stackframe/init-stack@latest --no-browser
   ```

2. Follow the prompts:
   - Choose "Next.js App Router" when asked about your framework
   - Select "Email/Password" for authentication method
   - Allow it to create the necessary files

3. The installer will provide you with three environment variables. Copy them to your `app/.env` file:
   ```bash
   NEXT_PUBLIC_STACK_PROJECT_ID=your_actual_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_actual_publishable_key
   STACK_SECRET_SERVER_KEY=your_actual_secret_key
   ```

## Step 6: Restart Development Server

1. Stop your current dev server (Ctrl+C if running)
2. Start it again to pick up the new environment variables:
   ```bash
   npm run dev
   ```

## Step 7: Verify Everything Works

1. Open your browser to `http://localhost:3322`
2. You should see the authentication UI provided by Neon Auth
3. Try creating an account and logging in
4. Once logged in, test creating/editing categories and sections

## Troubleshooting

### Migration Fails

- **Error: "relation already exists"**: Your database already has tables. You can either:
  - Drop all tables in Neon dashboard and re-run migrations
  - Or use `npm run db:generate` to create a new migration that handles existing tables

### Connection Timeout

- **Error: "connect ETIMEDOUT"**: Make sure you're using the **direct** connection string, not the pooled one
- Check your firewall/VPN settings aren't blocking the connection

### Environment Variables Not Loading

- Make sure `.env` is in the `app/` directory, not the root
- Restart your dev server after changing environment variables
- Verify there are no syntax errors in the `.env` file

### Authentication Not Working

- Make sure all three Neon Auth environment variables are set correctly
- Check the Neon Auth dashboard at [app.stack-auth.com](https://app.stack-auth.com) for any configuration issues
- Verify your Neon database connection is working first (test with the API endpoints)

## Benefits of Neon

- **Serverless**: Works perfectly with Vercel and other serverless platforms
- **Auto-scaling**: Database scales automatically with your usage
- **Branching**: Create database branches for development/staging
- **Fast**: HTTP-based queries optimized for serverless
- **Free Tier**: Generous limits for small projects

## Next Steps

Once everything is working:

1. Commit your changes to git (`.env` is already in `.gitignore`)
2. Push to GitHub
3. Deploy to Vercel:
   - Connect your GitHub repo
   - Add the environment variables in Vercel dashboard
   - Deploy!

Your app will now use the same Neon database in both local development and production.
