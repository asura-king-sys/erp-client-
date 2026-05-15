const db = require('../src/config/db');

async function check() {
  try {
    const res = await db.query('SELECT * FROM attendance ORDER BY work_date DESC LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
