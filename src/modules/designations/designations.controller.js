const db = require('../../config/db');

exports.getAllDesignations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM designations ORDER BY title');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createDesignation = async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO designations (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateDesignation = async (req, res) => {
  const { title, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE designations SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM designations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    res.json({ success: true, message: 'Designation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
