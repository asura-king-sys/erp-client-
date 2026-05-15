const db = require('../../config/db');

exports.getAttendanceTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(work_date, 'YYYY-MM-DD') as date,
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'half_day') as half_day
      FROM attendance
      WHERE work_date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY work_date
      ORDER BY work_date ASC
    `;
    const result = await db.query(query);
    
    // Parse the counts to integers
    const data = result.rows.map(row => ({
      date: row.date,
      present: parseInt(row.present || 0),
      absent: parseInt(row.absent || 0),
      half_day: parseInt(row.half_day || 0)
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching attendance trends:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLeaveSummary = async (req, res) => {
  try {
    const query = `
      SELECT
        leave_type_name,
        SUM(used_days) as taken,
        SUM(pending_days) as balance
      FROM leave_balances
      GROUP BY leave_type_name
    `;
    const result = await db.query(query);

    const data = {};
    result.rows.forEach(row => {
      // Convert 'Casual Leave' to 'casual_leave' for the key
      const key = row.leave_type_name.toLowerCase().replace(/\s+/g, '_');
      data[key] = {
        taken: parseFloat(row.taken || 0),
        balance: parseFloat(row.balance || 0)
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching leave summary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDepartmentDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.name,
        COUNT(e.id) as value
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name
    `;
    const result = await db.query(query);

    const data = result.rows.map(row => ({
      name: row.name,
      value: parseInt(row.value || 0)
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching department distribution:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
