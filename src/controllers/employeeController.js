const db = require('../config/db');

/**
 * @desc    Get all employees with their department and designation
 * @route   GET /api/employees
 * @access  Private (To be implemented)
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        e.id, 
        e.employee_code, 
        e.first_name, 
        e.last_name, 
        e.email, 
        e.status,
        d.name as department,
        ds.title as designation
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      JOIN designations ds ON e.designation_id = ds.id
      ORDER BY e.created_at DESC
    `;
    
    const { rows } = await db.query(query);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM employees WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};
