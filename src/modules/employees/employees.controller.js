const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const emailService = require('../../utils/emailService');
const crypto = require('crypto');

const generateEmployeeCode = async () => {
  const result = await db.query(
    "SELECT employee_code FROM employees WHERE employee_code LIKE 'EMP%' ORDER BY employee_code DESC LIMIT 1"
  );

  if (result.rows.length === 0) {
    return 'EMP001';
  }

  const lastCode = result.rows[0].employee_code;
  const lastNumber = parseInt(lastCode.replace('EMP', ''));
  const nextNumber = lastNumber + 1;
  return `EMP${nextNumber.toString().padStart(3, '0')}`;
};

exports.getAllEmployees = async (req, res) => {
  const { dept, status } = req.query;
  let query = `
    SELECT e.*, d.name as department_name, ds.title as designation_title 
    FROM employees e
    JOIN departments d ON e.department_id = d.id
    JOIN designations ds ON e.designation_id = ds.id
    WHERE 1=1
  `;
  const params = [];

  if (dept) {
    params.push(dept);
    query += ` AND e.department_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND e.status = $${params.length}`;
  }

  try {
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, d.name as department_name, ds.title as designation_title, m.first_name as manager_first_name, m.last_name as manager_last_name
       FROM employees e
       JOIN departments d ON e.department_id = d.id
       JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      country,
      pin_code,
      department_id,
      designation_id,
      manager_id,
      date_of_joining,
      role, // user role: admin, hr_manager, employee
      password,
    } = req.body;

    const employee_code = await generateEmployeeCode();

    const empResult = await client.query(
      `INSERT INTO employees (
        employee_code, first_name, last_name, email, phone, date_of_birth, 
        gender, address, city, state, country, pin_code, 
        department_id, designation_id, manager_id, date_of_joining
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *`,
      [
        employee_code,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        city,
        state,
        country,
        pin_code,
        department_id,
        designation_id,
        manager_id,
        date_of_joining,
      ]
    );

    const employee = empResult.rows[0];

    // Create User Account
    const username = email.split('@')[0];
    const tempPassword = password || (Math.random().toString(36).slice(-8) + 'Temp@123');
    const password_hash = await bcrypt.hash(tempPassword, 10);

    await client.query(
      `INSERT INTO users (employee_id, username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5)`,
      [employee.id, username, email, password_hash, role || 'employee']
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: employee });

    // Send Welcome Email (async)
    try {
      await emailService.sendWelcomeEmail(email, first_name, tempPassword);
      console.log('Welcome email sent to:', email);
      console.log('Temporary Password:', tempPassword);
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  } finally {
    client.release();
  }
};

exports.updateEmployee = async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    address,
    city,
    state,
    country,
    pin_code,
    department_id,
    designation_id,
    manager_id,
    status,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE employees SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        country = COALESCE($9, country),
        pin_code = COALESCE($10, pin_code),
        department_id = COALESCE($11, department_id),
        designation_id = COALESCE($12, designation_id),
        manager_id = COALESCE($13, manager_id),
        status = COALESCE($14, status),
        updated_at = NOW()
      WHERE id = $15 RETURNING *`,
      [
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        address,
        city,
        state,
        country,
        pin_code,
        department_id,
        designation_id,
        manager_id,
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    // Soft delete: set status to terminated
    const result = await db.query(
      "UPDATE employees SET status = 'terminated', updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Also deactivate user
    await db.query('UPDATE users SET is_active = FALSE WHERE employee_id = $1', [req.params.id]);

    res.json({ success: true, message: 'Employee terminated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
