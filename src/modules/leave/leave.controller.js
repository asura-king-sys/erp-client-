const db = require('../../config/db');
const emailService = require('../../utils/emailService');

exports.getLeaveTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM leave_types ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createLeaveType = async (req, res) => {
  const { name, description, default_days } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO leave_types (name, description, default_days) VALUES ($1, $2, $3) RETURNING *',
      [name, description, default_days]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyBalances = async (req, res) => {
  const year = new Date().getFullYear();
  try {
    const result = await db.query(
      `SELECT lb.*, lt.name as leave_type_name 
       FROM leave_balances lb 
       JOIN leave_types lt ON lb.leave_type_id = lt.id 
       WHERE lb.employee_id = $1 AND lb.year = $2`,
      [req.user.employee_id, year]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeBalances = async (req, res) => {
  const year = new Date().getFullYear();
  try {
    const result = await db.query(
      `SELECT lb.*, lt.name as leave_type_name 
       FROM leave_balances lb 
       JOIN leave_types lt ON lb.leave_type_id = lt.id 
       WHERE lb.employee_id = $1 AND lb.year = $2`,
      [req.params.employeeId, year]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.requestLeave = async (req, res) => {
  const { leave_type_id, from_date, to_date, reason } = req.body;
  const employeeId = req.user.employee_id;
  const year = new Date(from_date).getFullYear();

  try {
    const fromDate = new Date(from_date);
    const toDate = new Date(to_date);
    const daysRequested = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
    // Check balance
    const balanceRes = await db.query(
      'SELECT * FROM leave_balances WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3',
      [employeeId, leave_type_id, year]
    );

    if (balanceRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No leave balance found for this type' });
    }

    const balance = balanceRes.rows[0];
    const available = parseFloat(balance.allocated_days) - parseFloat(balance.used_days) - parseFloat(balance.pending_days);

    if (available < daysRequested) {
      return res.status(400).json({ success: false, message: 'Insufficient leave balance' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const requestRes = await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, from_date, to_date, days_requested, reason, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
        [employeeId, leave_type_id, from_date, to_date, daysRequested, reason]
      );

      // Update pending days in balance
      await client.query(
        'UPDATE leave_balances SET pending_days = pending_days + $1 WHERE id = $2',
        [daysRequested, balance.id]
      );

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: requestRes.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT lr.*, lt.name as leave_type_name 
       FROM leave_requests lr 
       JOIN leave_types lt ON lr.leave_type_id = lt.id 
       WHERE lr.employee_id = $1 ORDER BY lr.created_at DESC`,
      [req.user.employee_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT lr.*, lt.name as leave_type_name, e.first_name, e.last_name 
       FROM leave_requests lr 
       JOIN leave_types lt ON lr.leave_type_id = lt.id 
       JOIN employees e ON lr.employee_id = e.id 
       ORDER BY lr.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveLeave = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const requestRes = await client.query(
      `SELECT lr.*, e.email, e.first_name, e.last_name 
       FROM leave_requests lr 
       JOIN employees e ON lr.employee_id = e.id 
       WHERE lr.id = $1`, 
      [req.params.id]
    );
    if (requestRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = requestRes.rows[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    // Update request status
    await client.query(
      "UPDATE leave_requests SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2",
      [req.user.employee_id, req.params.id]
    );

    // Update balance: deduct from pending, add to used
    const year = new Date(request.from_date).getFullYear();
    await client.query(
      `UPDATE leave_balances 
       SET used_days = used_days + $1, pending_days = pending_days - $1 
       WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
      [request.days_requested, request.employee_id, request.leave_type_id, year]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Leave approved successfully' });

    // Send email notification (async)
    try {
      await emailService.sendLeaveApprovalEmail(
        request.email, 
        request.first_name, 
        request.from_date, 
        request.to_date, 
        request.days_requested
      );
      console.log('Approval email sent to:', request.email);
    } catch (emailErr) {
      console.error('Failed to send leave approval email:', emailErr);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

exports.rejectLeave = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const requestRes = await client.query(
      `SELECT lr.*, e.email, e.first_name, e.last_name 
       FROM leave_requests lr 
       JOIN employees e ON lr.employee_id = e.id 
       WHERE lr.id = $1`, 
      [req.params.id]
    );
    if (requestRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = requestRes.rows[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request is already processed' });
    }

    // Update request status
    await client.query(
      "UPDATE leave_requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2",
      [req.user.employee_id, req.params.id]
    );

    // Update balance: deduct from pending
    const year = new Date(request.from_date).getFullYear();
    await client.query(
      `UPDATE leave_balances 
       SET pending_days = pending_days - $1 
       WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
      [request.days_requested, request.employee_id, request.leave_type_id, year]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Leave rejected successfully' });

    // Send email notification (async)
    try {
      await emailService.sendLeaveRejectionEmail(
        request.email, 
        request.first_name, 
        request.from_date, 
        request.to_date, 
        req.body.reason
      );
      console.log('Rejection email sent to:', request.email);
    } catch (emailErr) {
      console.error('Failed to send leave rejection email:', emailErr);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};
