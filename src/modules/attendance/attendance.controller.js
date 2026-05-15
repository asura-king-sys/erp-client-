const db = require('../../config/db');

exports.clockIn = async (req, res) => {
  const employeeId = req.user.employee_id;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to an employee' });
  }

  const today = new Date().toLocaleDateString('en-CA');

  try {
    // Check if already clocked in today
    const existing = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND work_date = $2',
      [employeeId, today]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already clocked in today' });
    }

    const result = await db.query(
      'INSERT INTO attendance (employee_id, work_date, check_in, status) VALUES ($1, $2, NOW(), $3) RETURNING *',
      [employeeId, today, 'present']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clockOut = async (req, res) => {
  const employeeId = req.user.employee_id;
  if (!employeeId) {
    return res.status(400).json({ success: false, message: 'User is not linked to an employee' });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Check if clocked in today
    const existing = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND work_date = $2',
      [employeeId, today]
    );

    if (existing.rows.length === 0 || !existing.rows[0].check_in) {
      return res.status(400).json({ success: false, message: 'Not clocked in today' });
    }

    if (existing.rows[0].check_out) {
      return res.status(400).json({ success: false, message: 'Already clocked out today' });
    }

    const checkIn = new Date(existing.rows[0].check_in);
    const checkOut = new Date();
    const hoursWorked = Math.round(((checkOut - checkIn) / (1000 * 60 * 60)) * 100) / 100;

    const result = await db.query(
      'UPDATE attendance SET check_out = $1, work_hours = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [checkOut, hoursWorked, existing.rows[0].id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY work_date DESC',
      [req.user.employee_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY work_date DESC',
      [req.params.employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       ORDER BY a.work_date DESC, a.check_in DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
