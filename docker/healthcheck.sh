#!/bin/sh
# ==============================================================================
# AI Prompt Builder - Health Check Script
# ==============================================================================
# Comprehensive health check for Docker container
# ==============================================================================

set -e

# Configuration
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:3000/api/health}"
TIMEOUT="${HEALTH_TIMEOUT:-3}"
MAX_RETRIES="${HEALTH_MAX_RETRIES:-3}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Check if HTTP endpoint is responding
check_http() {
    local retry=0

    while [ $retry -lt $MAX_RETRIES ]; do
        if curl -f -s -m "$TIMEOUT" "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_info "HTTP endpoint is healthy"
            return 0
        fi

        retry=$((retry + 1))
        if [ $retry -lt $MAX_RETRIES ]; then
            log_warn "HTTP check failed, retrying ($retry/$MAX_RETRIES)..."
            sleep 1
        fi
    done

    log_error "HTTP endpoint is unhealthy after $MAX_RETRIES attempts"
    return 1
}

# Check if database is accessible
check_database() {
    DB_FILE="${DATABASE_URL:-/app/data/prompts.db}"
    DB_FILE=$(echo "$DB_FILE" | sed 's/file://')

    if [ ! -f "$DB_FILE" ]; then
        log_error "Database file not found: $DB_FILE"
        return 1
    fi

    if [ ! -r "$DB_FILE" ]; then
        log_error "Database file not readable: $DB_FILE"
        return 1
    fi

    # Try to query the database
    if sqlite3 "$DB_FILE" "SELECT 1;" > /dev/null 2>&1; then
        log_info "Database is accessible"
        return 0
    else
        log_error "Database query failed"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local threshold=90
    local usage=$(df /app/data | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$usage" -lt "$threshold" ]; then
        log_info "Disk space is healthy (${usage}% used)"
        return 0
    else
        log_warn "Disk space is running low (${usage}% used)"
        return 1
    fi
}

# Check memory usage
check_memory() {
    local threshold=90
    local mem_total=$(free | grep Mem | awk '{print $2}')
    local mem_used=$(free | grep Mem | awk '{print $3}')
    local mem_percent=$((mem_used * 100 / mem_total))

    if [ "$mem_percent" -lt "$threshold" ]; then
        log_info "Memory usage is healthy (${mem_percent}% used)"
        return 0
    else
        log_warn "Memory usage is high (${mem_percent}% used)"
        return 1
    fi
}

# Main health check
main() {
    echo "================================"
    echo "Health Check - $(date)"
    echo "================================"

    local exit_code=0

    # Run all checks
    check_http || exit_code=1
    check_database || exit_code=1
    check_disk_space || exit_code=1

    # Optional: check memory (may not be available in all environments)
    if command -v free > /dev/null 2>&1; then
        check_memory || exit_code=1
    fi

    echo "================================"

    if [ $exit_code -eq 0 ]; then
        log_info "All health checks passed"
    else
        log_error "Some health checks failed"
    fi

    return $exit_code
}

# Run main function
main
