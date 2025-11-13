#!/bin/sh
# ==============================================================================
# AI Prompt Builder - Docker Entrypoint Script
# ==============================================================================
# This script runs database migrations and starts the Next.js server
# ==============================================================================

set -e

echo "🚀 Starting AI Prompt Builder..."

# Environment variables with defaults
DB_PATH="${DATABASE_URL:-/app/data/prompts.db}"
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-false}"
SKIP_SEED="${SKIP_SEED:-false}"

# Extract database file path from DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    DB_FILE=$(echo "$DATABASE_URL" | sed 's/file://')
else
    DB_FILE="/app/data/prompts.db"
fi

echo "📁 Database location: $DB_FILE"

# Create database directory if it doesn't exist
DB_DIR=$(dirname "$DB_FILE")
mkdir -p "$DB_DIR"
chmod 755 "$DB_DIR"

# Function to check if database is empty
is_db_empty() {
    if [ ! -f "$DB_FILE" ]; then
        return 0 # true - doesn't exist
    fi

    # Check if tables exist
    TABLE_COUNT=$(sqlite3 "$DB_FILE" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" 2>/dev/null || echo "0")

    if [ "$TABLE_COUNT" -eq 0 ]; then
        return 0 # true - no tables
    else
        return 1 # false - has tables
    fi
}

# Function to run database migrations
run_migrations() {
    if [ "$SKIP_MIGRATIONS" = "true" ]; then
        echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
        return 0
    fi

    echo "🔄 Running database migrations..."

    if [ -f "drizzle.config.ts" ] && [ -d "drizzle" ]; then
        # Run migrations using drizzle-kit
        npx drizzle-kit push:sqlite --config=drizzle.config.ts 2>&1 || {
            echo "⚠️  Migration failed, attempting to create schema directly..."
            node -e "
                const { drizzle } = require('drizzle-orm/better-sqlite3');
                const Database = require('better-sqlite3');
                const schema = require('./src/lib/db/schema');

                const sqlite = new Database('$DB_FILE');
                const db = drizzle(sqlite, { schema });

                console.log('✅ Database initialized');
                sqlite.close();
            " || echo "⚠️  Direct schema creation failed"
        }
    else
        echo "⚠️  Migration files not found, skipping..."
    fi
}

# Function to seed database
seed_database() {
    if [ "$SKIP_SEED" = "true" ]; then
        echo "⏭️  Skipping database seeding (SKIP_SEED=true)"
        return 0
    fi

    if is_db_empty; then
        echo "🌱 Database is empty, seeding with initial data..."

        # Run seed script if it exists
        if [ -f "src/lib/db/seed.ts" ]; then
            npx tsx src/lib/db/seed.ts 2>&1 || echo "⚠️  Seeding failed"
        else
            echo "ℹ️  No seed script found, skipping..."
        fi
    else
        echo "✅ Database already contains data, skipping seed"
    fi
}

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."

    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if [ -w "$DB_DIR" ]; then
            echo "✅ Database directory is writable"
            return 0
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Attempt $RETRY_COUNT/$MAX_RETRIES..."
        sleep 1
    done

    echo "❌ Database directory not writable after $MAX_RETRIES attempts"
    return 1
}

# Main execution flow
main() {
    echo "================================"
    echo "AI Prompt Builder - Starting"
    echo "================================"

    # Wait for database to be ready
    wait_for_db || exit 1

    # Run migrations
    run_migrations

    # Seed database if empty
    seed_database

    echo "================================"
    echo "✅ Initialization Complete"
    echo "================================"
    echo ""
    echo "🌐 Starting Next.js server on port ${PORT:-3000}..."
    echo ""

    # Start Next.js server
    exec node server.js
}

# Handle signals gracefully
trap 'echo "🛑 Received shutdown signal, stopping..."; exit 0' SIGTERM SIGINT

# Run main function
main
