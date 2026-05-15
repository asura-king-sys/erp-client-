/**
 * reset.js — Drop all application tables and re-run migrations + seed
 *
 * ⚠️  WARNING: This destroys ALL data.  Development use only.
 *
 * Usage:
 *   node reset.js
 *   npm run db:reset
 */

'use strict';

require('dotenv').config();
const { Pool }   = require('pg');
const { execSync } = require('child_process');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME     || 'erp_hr_db',
  user:     process.env.DB_USER     || 'erp_user',
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// Drop order must respect FK constraints (reverse of creation order)
const DROP_STATEMENTS = `
  DROP TABLE IF EXISTS _migrations       CASCADE;
  DROP TABLE IF EXISTS documents         CASCADE;
  DROP TABLE IF EXISTS payslips          CASCADE;
  DROP TABLE IF EXISTS salary_structures CASCADE;
  DROP TABLE IF EXISTS attendance        CASCADE;
  DROP TABLE IF EXISTS leave_requests    CASCADE;
  DROP TABLE IF EXISTS leave_balances    CASCADE;
  DROP TABLE IF EXISTS leave_types       CASCADE;
  DROP TABLE IF EXISTS users             CASCADE;
  DROP TABLE IF EXISTS employees         CASCADE;
  DROP TABLE IF EXISTS designations      CASCADE;
  DROP TABLE IF EXISTS departments       CASCADE;

  DROP TYPE IF EXISTS payslip_status       CASCADE;
  DROP TYPE IF EXISTS attendance_status    CASCADE;
  DROP TYPE IF EXISTS leave_request_status CASCADE;
  DROP TYPE IF EXISTS user_role            CASCADE;
  DROP TYPE IF EXISTS employee_status      CASCADE;
  DROP TYPE IF EXISTS gender_type          CASCADE;
  DROP TYPE IF EXISTS document_type        CASCADE;

  DROP FUNCTION IF EXISTS trigger_set_updated_at CASCADE;
`;

async function reset() {
  console.log(bold('\n╔══════════════════════════════════════════╗'));
  console.log(bold('║      PERN ERP — Database Reset           ║'));
  console.log(bold('╚══════════════════════════════════════════╝'));
  console.log(yellow('\n  ⚠️  Dropping all tables and types...\n'));

  const client = await pool.connect();
  try {
    await client.query(DROP_STATEMENTS);
    console.log('  ✔  All tables dropped.\n');
  } finally {
    client.release();
    await pool.end();
  }

  console.log('  ▶  Running migrations...\n');
  execSync('node migrate.js', { stdio: 'inherit' });

  console.log('\n  ▶  Running seed...\n');
  execSync('node seed.js', { stdio: 'inherit' });
}

reset().catch((err) => {
  console.error(red('Fatal: ' + err.message));
  process.exit(1);
});
