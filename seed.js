/**
 * seed.js — PERN ERP Database Seeder
 *
 * Inserts realistic sample data for development / demo purposes.
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING.
 *
 * Usage:
 *   node seed.js
 *   npm run db:seed
 */

'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME     || 'erp_hr_db',
  user:     process.env.DB_USER     || 'erp_user',
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ─── Date helpers ─────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function toTs(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+05:30`).toISOString();
}

const CURRENT_YEAR = new Date().getFullYear();
const PLAIN_PASSWORD = 'Admin@123';

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(bold('\n╔══════════════════════════════════════════╗'));
  console.log(bold('║       PERN ERP — Database Seeder         ║'));
  console.log(bold('╚══════════════════════════════════════════╝\n'));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(PLAIN_PASSWORD, 12);

    // ── 1. Departments ──────────────────────────────────────────────────────
    console.log(cyan('  [1/8] Seeding departments...'));
    const deptResult = await client.query(`
      INSERT INTO departments (name, code, description)
      VALUES
        ('Engineering',        'ENG', 'Software development and technical operations'),
        ('Human Resources',    'HR',  'People management, hiring and employee welfare')
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code;
    `);

    // Build lookup maps (works even if rows already existed)
    let deptMap = {};
    for (const row of deptResult.rows) deptMap[row.code] = row.id;

    // Fetch any that already existed
    if (!deptMap['ENG'] || !deptMap['HR']) {
      const existing = await client.query(
        "SELECT id, code FROM departments WHERE code IN ('ENG','HR');"
      );
      for (const row of existing.rows) deptMap[row.code] = row.id;
    }

    // ── 2. Designations ─────────────────────────────────────────────────────
    console.log(cyan('  [2/8] Seeding designations...'));
    const desigResult = await client.query(`
      INSERT INTO designations (title, department_id, level, description)
      VALUES
        ('Software Engineer', $1, 2, 'Full-stack developer'),
        ('HR Manager',        $2, 4, 'Manages HR operations and hiring'),
        ('Admin',             $2, 5, 'System administrator with full access')
      ON CONFLICT (title) DO NOTHING
      RETURNING id, title;
    `, [deptMap['ENG'], deptMap['HR']]);

    let desigMap = {};
    for (const row of desigResult.rows) desigMap[row.title] = row.id;

    if (Object.keys(desigMap).length < 3) {
      const existing = await client.query(
        "SELECT id, title FROM designations WHERE title IN ('Software Engineer','HR Manager','Admin');"
      );
      for (const row of existing.rows) desigMap[row.title] = row.id;
    }

    // ── 3. Employees ─────────────────────────────────────────────────────────
    console.log(cyan('  [3/8] Seeding employees...'));

    const employeeSeed = [
      {
        code: 'EMP001', first: 'Arjun', last: 'Sharma',
        email: 'arjun.sharma@erp.dev', phone: '+91-9876543210',
        dob: '1992-04-15', gender: 'male',
        address: '12 MG Road, Block A', city: 'Bengaluru', state: 'Karnataka', pin: '560001',
        deptId: deptMap['ENG'], desigId: desigMap['Software Engineer'], doj: '2021-03-01',
      },
      {
        code: 'EMP002', first: 'Priya', last: 'Mehta',
        email: 'priya.mehta@erp.dev', phone: '+91-9123456789',
        dob: '1989-11-22', gender: 'female',
        address: '45 Andheri West', city: 'Mumbai', state: 'Maharashtra', pin: '400053',
        deptId: deptMap['HR'], desigId: desigMap['HR Manager'], doj: '2019-07-15',
      },
      {
        code: 'EMP003', first: 'Rohan', last: 'Verma',
        email: 'rohan.verma@erp.dev', phone: '+91-9988776655',
        dob: '1995-08-08', gender: 'male',
        address: '8 Connaught Place', city: 'New Delhi', state: 'Delhi', pin: '110001',
        deptId: deptMap['HR'], desigId: desigMap['Admin'], doj: '2022-01-10',
      },
    ];

    for (const e of employeeSeed) {
      await client.query(`
        INSERT INTO employees
          (employee_code, first_name, last_name, email, phone,
           date_of_birth, gender, address, city, state, country, pin_code,
           department_id, designation_id, date_of_joining, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7::gender_type, $8, $9, $10, 'India', $11,
                $12::uuid, $13::uuid, $14, 'active'::employee_status)
        ON CONFLICT (employee_code) DO NOTHING;
      `, [e.code, e.first, e.last, e.email, e.phone,
          e.dob, e.gender, e.address, e.city, e.state, e.pin,
          e.deptId, e.desigId, e.doj]);
    }

    let empMap = {};
    const existing = await client.query(
      "SELECT id, employee_code FROM employees WHERE employee_code IN ('EMP001','EMP002','EMP003');"
    );
    for (const row of existing.rows) empMap[row.employee_code] = row.id;

    // ── 4. Users ─────────────────────────────────────────────────────────────
    console.log(cyan('  [4/8] Seeding users...'));
    await client.query(`
      INSERT INTO users (employee_id, username, email, password_hash, role)
      VALUES
        ($1::uuid, 'rohan.verma',   'rohan.verma@erp.dev',   $4, 'admin'::user_role),
        ($2::uuid, 'priya.mehta',   'priya.mehta@erp.dev',   $4, 'hr_manager'::user_role),
        ($3::uuid, 'arjun.sharma',  'arjun.sharma@erp.dev',  $4, 'employee'::user_role)
      ON CONFLICT (username) DO NOTHING;
    `, [empMap['EMP003'], empMap['EMP002'], empMap['EMP001'], passwordHash]);

    // ── 5. Leave Types ───────────────────────────────────────────────────────
    console.log(cyan('  [5/8] Seeding leave types...'));
    const ltResult = await client.query(`
      INSERT INTO leave_types (name, code, days_allowed, is_paid, carry_forward, description)
      VALUES
        ('Casual Leave',  'CL', 12, TRUE,  FALSE, 'General purpose casual leave'),
        ('Sick Leave',    'SL',  8, TRUE,  FALSE, 'Leave for medical reasons'),
        ('Earned Leave',  'EL', 15, TRUE,  TRUE,  'Accrued through service, carry-forward allowed')
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code;
    `);

    let ltMap = {};
    for (const row of ltResult.rows) ltMap[row.code] = row.id;

    if (Object.keys(ltMap).length < 3) {
      const existing = await client.query(
        "SELECT id, code FROM leave_types WHERE code IN ('CL','SL','EL');"
      );
      for (const row of existing.rows) ltMap[row.code] = row.id;
    }

    // ── 6. Leave Balances ────────────────────────────────────────────────────
    console.log(cyan('  [6/8] Seeding leave balances...'));
    const leaveAlloc = { CL: 12, SL: 8, EL: 15 };

    for (const empCode of ['EMP001', 'EMP002', 'EMP003']) {
      for (const [ltCode, days] of Object.entries(leaveAlloc)) {
        await client.query(`
          INSERT INTO leave_balances
            (employee_id, leave_type_id, year, allocated_days, used_days, pending_days)
          VALUES ($1, $2, $3, $4, 0, 0)
          ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
        `, [empMap[empCode], ltMap[ltCode], CURRENT_YEAR, days]);
      }
    }

    // ── 7. Attendance (past 7 working days) ──────────────────────────────────
    console.log(cyan('  [7/8] Seeding attendance records...'));
    for (let i = 1; i <= 7; i++) {
      const date = daysAgo(i);
      const dayOfWeek = new Date(date).getDay();
      const status = (dayOfWeek === 0 || dayOfWeek === 6) ? 'weekend' : 'present';

      for (const empCode of ['EMP001', 'EMP002', 'EMP003']) {
        const checkIn  = status === 'present' ? toTs(date, '09:15') : null;
        const checkOut = status === 'present' ? toTs(date, '18:30') : null;
        const hours    = status === 'present' ? 9.25 : null;

        await client.query(`
          INSERT INTO attendance
            (employee_id, work_date, check_in, check_out, work_hours, status)
          VALUES ($1::uuid, $2::date, $3, $4, $5, $6::attendance_status)
          ON CONFLICT (employee_id, work_date) DO NOTHING;
        `, [empMap[empCode], date, checkIn, checkOut, hours, status]);
      }
    }

    // ── 8. Salary Structures ─────────────────────────────────────────────────
    console.log(cyan('  [8/8] Seeding salary structures...'));
    const salaries = {
      EMP001: { basic: 70000, hra: 28000, ta: 3000, da: 5000, other: 2000, pf: 8400, esi: 0,   tds: 4000, otherD: 0 },
      EMP002: { basic: 90000, hra: 36000, ta: 4000, da: 7000, other: 3000, pf: 10800, esi: 0,  tds: 8000, otherD: 0 },
      EMP003: { basic: 95000, hra: 38000, ta: 4500, da: 8000, other: 4500, pf: 11400, esi: 0,  tds: 9000, otherD: 0 },
    };

    for (const [empCode, s] of Object.entries(salaries)) {
      await client.query(`
        INSERT INTO salary_structures
          (employee_id, effective_from,
           basic_salary, hra, ta, da, other_allowances,
           pf_deduction, esi_deduction, tds_deduction, other_deductions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (employee_id) DO NOTHING;
      `, [
        empMap[empCode], '2024-01-01',
        s.basic, s.hra, s.ta, s.da, s.other,
        s.pf, s.esi, s.tds, s.otherD,
      ]);
    }

    // ── 9. Customers ─────────────────────────────────────────────────────────
    console.log(cyan('  [9/14] Seeding customers...'));
    const customerResult = await client.query(`
      INSERT INTO customers (name, email, phone, address, city, country, credit_limit)
      VALUES
        ('Acme Corp', 'contact@acmecorp.com', '+1-555-0100', '123 Acme St', 'New York', 'USA', 50000.00),
        ('Globex', 'info@globex.com', '+1-555-0101', '456 Globex Ave', 'Chicago', 'USA', 100000.00),
        ('Soylent', 'sales@soylent.com', '+1-555-0102', '789 Soylent Blvd', 'San Francisco', 'USA', 25000.00),
        ('Initech', 'hello@initech.com', '+1-555-0103', '101 Initech Pkwy', 'Austin', 'USA', 75000.00),
        ('Umbrella Corp', 'admin@umbrella.com', '+1-555-0104', '202 Umbrella Way', 'Seattle', 'USA', 150000.00)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `);

    let customerMap = {};
    for (const row of customerResult.rows) customerMap[row.email] = row.id;

    if (Object.keys(customerMap).length < 5) {
      const existing = await client.query(
        "SELECT id, email FROM customers;"
      );
      for (const row of existing.rows) customerMap[row.email] = row.id;
    }

    // ── 10. Product Categories ────────────────────────────────────────────────
    console.log(cyan('  [10/14] Seeding product categories...'));
    const categoryResult = await client.query(`
      INSERT INTO product_categories (name, description)
      VALUES
        ('Electronics', 'Electronic devices and gadgets'),
        ('Furniture', 'Office and home furniture'),
        ('Office Supplies', 'General office supplies and stationery')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);

    let categoryMap = {};
    for (const row of categoryResult.rows) categoryMap[row.name] = row.id;

    if (Object.keys(categoryMap).length < 3) {
      const existing = await client.query(
        "SELECT id, name FROM product_categories;"
      );
      for (const row of existing.rows) categoryMap[row.name] = row.id;
    }

    // ── 11. Products ──────────────────────────────────────────────────────────
    console.log(cyan('  [11/14] Seeding products...'));
    const products = [
      { name: 'Laptop Pro', sku: 'ELEC-001', cat: 'Electronics', price: 1200.00, stock: 50 },
      { name: 'Smartphone X', sku: 'ELEC-002', cat: 'Electronics', price: 800.00, stock: 100 },
      { name: 'Wireless Mouse', sku: 'ELEC-003', cat: 'Electronics', price: 25.00, stock: 200 },
      { name: 'Ergonomic Chair', sku: 'FURN-001', cat: 'Furniture', price: 250.00, stock: 40 },
      { name: 'Standing Desk', sku: 'FURN-002', cat: 'Furniture', price: 400.00, stock: 20 },
      { name: 'Bookshelf', sku: 'FURN-003', cat: 'Furniture', price: 150.00, stock: 30 },
      { name: 'A4 Paper (Ream)', sku: 'OFF-001', cat: 'Office Supplies', price: 5.00, stock: 500 },
      { name: 'Pens (Box of 50)', sku: 'OFF-002', cat: 'Office Supplies', price: 10.00, stock: 150 },
      { name: 'Notebook', sku: 'OFF-003', cat: 'Office Supplies', price: 3.00, stock: 300 },
      { name: 'Stapler', sku: 'OFF-004', cat: 'Office Supplies', price: 8.00, stock: 100 }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (name, sku, category_id, unit_price, quantity_in_stock)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (sku) DO NOTHING;
      `, [p.name, p.sku, categoryMap[p.cat], p.price, p.stock]);
    }

    let productMap = {};
    const existingProducts = await client.query("SELECT id, sku FROM products;");
    for (const row of existingProducts.rows) productMap[row.sku] = row.id;

    // ── 12. Sales Orders & Items ──────────────────────────────────────────────
    console.log(cyan('  [12/14] Seeding sales orders...'));
    const orderResult = await client.query(`
      INSERT INTO sales_orders (customer_id, order_date, expected_delivery_date, subtotal, tax, total_amount, status)
      VALUES
        ($1, CURRENT_DATE - 5, CURRENT_DATE, 1225.00, 122.50, 1347.50, 'delivered'),
        ($2, CURRENT_DATE - 2, CURRENT_DATE + 3, 400.00, 40.00, 440.00, 'confirmed'),
        ($3, CURRENT_DATE, CURRENT_DATE + 5, 25.00, 2.50, 27.50, 'draft')
      RETURNING id, status;
    `, [customerMap['contact@acmecorp.com'], customerMap['info@globex.com'], customerMap['sales@soylent.com']]);

    if (orderResult.rows.length >= 3) {
      const o1 = orderResult.rows[0].id;
      const o2 = orderResult.rows[1].id;
      const o3 = orderResult.rows[2].id;

      await client.query(`
        INSERT INTO order_items (sales_order_id, product_id, quantity, unit_price, line_total)
        VALUES
          ($1, $4, 1, 1200.00, 1200.00),
          ($1, $5, 1, 25.00, 25.00),
          ($2, $6, 1, 400.00, 400.00),
          ($3, $5, 1, 25.00, 25.00)
      `, [o1, o2, o3, productMap['ELEC-001'], productMap['ELEC-003'], productMap['FURN-002']]);

      // ── 13. Invoices ────────────────────────────────────────────────────────
      console.log(cyan('  [13/14] Seeding invoices...'));
      const invoiceResult = await client.query(`
        INSERT INTO invoices (sales_order_id, customer_id, invoice_date, due_date, subtotal, tax, total_amount, amount_paid, payment_status)
        VALUES
          ($1, $4, CURRENT_DATE - 4, CURRENT_DATE + 26, 1225.00, 122.50, 1347.50, 1347.50, 'paid'),
          ($2, $5, CURRENT_DATE - 1, CURRENT_DATE + 29, 400.00, 40.00, 440.00, 200.00, 'partial'),
          ($3, $6, CURRENT_DATE, CURRENT_DATE + 30, 25.00, 2.50, 27.50, 0, 'pending')
        RETURNING id;
      `, [o1, o2, o3, customerMap['contact@acmecorp.com'], customerMap['info@globex.com'], customerMap['sales@soylent.com']]);

      // ── 14. Payments ────────────────────────────────────────────────────────
      console.log(cyan('  [14/14] Seeding payments...'));
      if (invoiceResult.rows.length >= 2) {
        const i1 = invoiceResult.rows[0].id;
        const i2 = invoiceResult.rows[1].id;

        await client.query(`
          INSERT INTO payments (invoice_id, payment_date, amount, payment_method, reference_number)
          VALUES
            ($1, CURRENT_DATE - 2, 1347.50, 'bank_transfer', 'REF-001'),
            ($2, CURRENT_DATE, 200.00, 'credit_card', 'REF-002')
        `, [i1, i2]);
      }
    }

    await client.query('COMMIT');

    console.log('\n' + bold('─'.repeat(46)));
    console.log(green('  ✅  Seeding completed successfully!'));
    console.log(bold('─'.repeat(46)));
    console.log(`
  Sample credentials (all share the same password):
  ┌─────────────────────────────────────────────┐
  │  Role        │ Username      │ Password      │
  ├──────────────┼───────────────┼───────────────┤
  │  admin       │ rohan.verma   │ Admin@123     │
  │  hr_manager  │ priya.mehta   │ Admin@123     │
  │  employee    │ arjun.sharma  │ Admin@123     │
  └─────────────────────────────────────────────┘
`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(red('\n  ✖  Seeding failed — transaction rolled back.'));
    console.error(red('     ' + err.message));
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(red('Fatal: ' + err.message));
  process.exit(1);
});
