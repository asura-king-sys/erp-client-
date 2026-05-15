/**
 * migrate.js — PERN ERP Database Migration Runner
 *
 * Reads all .sql files from ./migrations/ in alphabetical order and runs
 * them against the configured PostgreSQL database.
 *
 * Safe to re-run: all migrations use CREATE ... IF NOT EXISTS / DO $$ blocks.
 *
 * Usage:
 *   node migrate.js
 *   npm run db:migrate
 */

'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const fs       = require('fs');
const path     = require('path');

// ─── DB Pool ─────────────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME     || 'erp_hr_db',
  user:     process.env.DB_USER     || 'erp_user',
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

function getMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // alphabetical = numeric order due to 001_, 002_… prefix
}

// ─── Migration tracking table ─────────────────────────────────────────────────
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL      PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT filename FROM _migrations ORDER BY id;');
  return new Set(result.rows.map((r) => r.filename));
}

async function recordMigration(client, filename) {
  await client.query(
    'INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING;',
    [filename]
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function runMigrations() {
  console.log(bold('\n╔══════════════════════════════════════════╗'));
  console.log(bold('║   PERN ERP — Database Migration Runner   ║'));
  console.log(bold('╚══════════════════════════════════════════╝\n'));

  const files = getMigrationFiles();
  if (files.length === 0) {
    console.log(yellow('⚠  No migration files found in ./migrations/'));
    process.exit(0);
  }

  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    let ranCount  = 0;
    let skipCount = 0;
    let errCount  = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ${yellow('⏭  SKIP')}  ${file}  (already applied)`);
        skipCount++;
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql      = fs.readFileSync(filePath, 'utf8');

      // Each migration runs in its own transaction so a failure rolls back
      // only that file, leaving previous ones committed.
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await recordMigration(client, file);
        await client.query('COMMIT');
        console.log(`  ${green('✔  OK  ')}  ${file}`);
        ranCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ${red('✖  FAIL')}  ${file}`);
        console.error(`           ${red(err.message)}`);
        errCount++;
        // Continue running remaining files (non-fatal per file)
      }
    }

    console.log('\n' + bold('─'.repeat(46)));
    console.log(`  Applied : ${green(String(ranCount))}  |  Skipped : ${yellow(String(skipCount))}  |  Failed : ${errCount > 0 ? red(String(errCount)) : String(errCount)}`);
    console.log(bold('─'.repeat(46)) + '\n');

    if (errCount > 0) {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(red('Fatal error: ' + err.message));
  process.exit(1);
});
