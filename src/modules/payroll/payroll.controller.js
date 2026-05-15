const db = require('../../config/db');
const { generatePayslipPDF } = require('../../utils/pdfGenerator');


exports.getSalaryStructure = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM salary_structures WHERE employee_id = $1',
      [req.params.employeeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Salary structure not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrUpdateSalaryStructure = async (req, res) => {
  const {
    employee_id,
    effective_from,
    basic_salary,
    hra,
    ta,
    da,
    other_allowances,
    pf_deduction,
    esi_deduction,
    other_deductions,
  } = req.body;

  try {
    // Check if exists
    const existing = await db.query('SELECT id FROM salary_structures WHERE employee_id = $1', [employee_id]);

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE salary_structures SET 
          effective_from = $1, basic_salary = $2, hra = $3, ta = $4, da = $5, 
          other_allowances = $6, pf_deduction = $7, esi_deduction = $8, other_deductions = $9, 
          updated_at = NOW() 
        WHERE employee_id = $10 RETURNING *`,
        [effective_from, basic_salary, hra, ta, da, other_allowances, pf_deduction, esi_deduction, other_deductions, employee_id]
      );
    } else {
      result = await db.query(
        `INSERT INTO salary_structures (
          employee_id, effective_from, basic_salary, hra, ta, da, 
          other_allowances, pf_deduction, esi_deduction, other_deductions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [employee_id, effective_from, basic_salary, hra, ta, da, other_allowances, pf_deduction, esi_deduction, other_deductions]
      );
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.generatePayslip = async (req, res) => {
  const { employee_id, month, year, working_days, paid_days } = req.body;

  try {
    // Get salary structure
    const structRes = await db.query('SELECT * FROM salary_structures WHERE employee_id = $1', [employee_id]);
    if (structRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Employee has no salary structure' });
    }

    const struct = structRes.rows[0];
    const gross = parseFloat(struct.gross_salary);
    const tds = gross * 0.1; // 10% TDS as requested
    const otherDeductions = parseFloat(struct.pf_deduction) + parseFloat(struct.esi_deduction) + parseFloat(struct.other_deductions);
    const totalDeductions = tds + otherDeductions;
    const netSalary = gross - totalDeductions;

    const result = await db.query(
      `INSERT INTO payslips (
        employee_id, salary_struct_id, month, year, working_days, paid_days,
        basic_salary, hra, ta, da, other_allowances, 
        pf_deduction, esi_deduction, tds_deduction, other_deductions,
        gross_salary, net_salary, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'generated') 
      RETURNING *`,
      [
        employee_id, struct.id, month, year, working_days || 0, paid_days || 0,
        struct.basic_salary, struct.hra, struct.ta, struct.da, struct.other_allowances,
        struct.pf_deduction, struct.esi_deduction, tds, struct.other_deductions,
        gross, netSalary
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'Payslip already exists for this month and year' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyPayslips = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM payslips WHERE employee_id = $1 ORDER BY year DESC, month DESC',
      [req.user.employee_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeePayslips = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM payslips WHERE employee_id = $1 ORDER BY year DESC, month DESC',
      [req.params.employeeId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPayslipPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payslip data
    const payslipRes = await db.query('SELECT * FROM payslips WHERE id = $1', [id]);
    if (payslipRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }
    const payslip = payslipRes.rows[0];

    // Check permissions (admin/hr or owner)
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager' && req.user.employee_id !== payslip.employee_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch employee data
    const employeeRes = await db.query(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = $1`,
      [payslip.employee_id]
    );
    const employee = employeeRes.rows[0];

    // Generate PDF
    const pdfBuffer = await generatePayslipPDF(payslip, employee);

    const filename = `payslip_${payslip.month}_${payslip.year}_${employee.first_name}_${employee.last_name}.pdf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

