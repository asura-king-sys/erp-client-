const db = require('../../config/db');

exports.getAllDepartments = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM departments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error (likely due to foreign key constraint)' });
  }
};
