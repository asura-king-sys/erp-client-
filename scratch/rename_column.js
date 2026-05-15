const db = require('../src/config/db');

async function fix() {
  try {
    await db.query('ALTER TABLE leave_requests RENAME COLUMN total_days TO days_requested');
    console.log('Successfully renamed total_days to days_requested');
    process.exit(0);
  } catch (err) {
    console.error('Error renaming column (maybe it was already renamed?):', err.message);
    process.exit(0); // non-fatal
  }
}

fix();
