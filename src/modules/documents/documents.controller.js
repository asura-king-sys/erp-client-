const db = require('../../config/db');

exports.uploadDocument = async (req, res) => {
  const { employee_id, document_type, file_url, title } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO documents (employee_id, document_type, file_url, title) VALUES ($1, $2, $3, $4) RETURNING *',
      [employee_id, document_type, file_url, title]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM documents WHERE employee_id = $1 ORDER BY created_at DESC',
      [employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM documents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
