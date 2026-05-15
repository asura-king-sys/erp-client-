const express = require('express');
const router = express.Router();
const payrollController = require('./payroll.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.get('/salary/:employeeId', checkRole(['admin', 'hr_manager', 'employee']), payrollController.getSalaryStructure);
router.post('/salary', checkRole(['admin', 'hr_manager']), payrollController.createOrUpdateSalaryStructure);

router.post('/payslips/generate', checkRole(['admin', 'hr_manager']), payrollController.generatePayslip);
router.get('/payslips/me', payrollController.getMyPayslips);
router.get('/payslips/:employeeId', checkRole(['admin', 'hr_manager']), payrollController.getEmployeePayslips);
router.get('/payslips/:id/pdf', payrollController.getPayslipPDF);

module.exports = router;

