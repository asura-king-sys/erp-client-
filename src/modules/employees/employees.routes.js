const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const employeesController = require('./employees.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');
const validate = require('../../middlewares/validate');

router.use(auth);

router.get('/', checkRole(['admin', 'hr_manager']), employeesController.getAllEmployees);
router.get('/:id', checkRole(['admin', 'hr_manager', 'employee']), employeesController.getEmployeeById);

router.post(
  '/',
  checkRole(['admin', 'hr_manager']),
  [
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('email').isEmail(),
    body('department_id').isUUID(),
    body('designation_id').isUUID(),
    body('date_of_joining').isDate(),
    validate,
  ],
  employeesController.createEmployee
);

router.put('/:id', checkRole(['admin', 'hr_manager']), employeesController.updateEmployee);

router.delete('/:id', checkRole(['admin']), employeesController.deleteEmployee);

module.exports = router;
