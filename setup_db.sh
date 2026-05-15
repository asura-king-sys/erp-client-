#!/usr/bin/env bash
# =============================================================================
# setup_db.sh — Create erp_hr_db and erp_user in PostgreSQL
# Run once on any machine that has PostgreSQL installed.
#
# Usage:
#   bash setup_db.sh
#
# This script connects as the postgres superuser.  If you need to specify a
# host / port, set PGHOST / PGPORT environment variables before running.
# =============================================================================

set -euo pipefail

DB_NAME="erp_hr_db"
DB_USER="erp_user"
# Change this password or set ERP_DB_PASSWORD before running
DB_PASSWORD="${ERP_DB_PASSWORD:-ErpStr0ng#Pass2024}"

echo "============================================="
echo "  PERN ERP — PostgreSQL database setup"
echo "============================================="

# ---------------------------------------------------------------------------
# 1. Create the dedicated application user (if it does not already exist)
# ---------------------------------------------------------------------------
echo "[1/3] Creating role '${DB_USER}' ..."
psql -U postgres -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
    RAISE NOTICE 'Role created.';
  ELSE
    RAISE NOTICE 'Role already exists — skipping creation.';
  END IF;
END
\$\$;
"

# ---------------------------------------------------------------------------
# 2. Create the database (if it does not already exist)
# ---------------------------------------------------------------------------
echo "[2/3] Creating database '${DB_NAME}' ..."
psql -U postgres -c "
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
\gexec
"

# ---------------------------------------------------------------------------
# 3. Grant all privileges
# ---------------------------------------------------------------------------
echo "[3/3] Granting privileges ..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Also grant schema-level privileges (PostgreSQL 15+ requires this)
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"
psql -U postgres -d "${DB_NAME}" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};"
psql -U postgres -d "${DB_NAME}" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};"

echo ""
echo "✅  Done!  Database '${DB_NAME}' and user '${DB_USER}' are ready."
echo "    Copy .env.example → .env and set DB_PASSWORD=${DB_PASSWORD}"
echo "============================================="
