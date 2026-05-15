const db = require('../src/config/db');

async function check() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'leave_balances'");
    console.log(JSON.stringify(res.rows.map(r => r.column_name), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
