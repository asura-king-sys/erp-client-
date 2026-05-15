const express = require('express');
const router = express.Router();
const departmentsController = require('./departments.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.get('/', departmentsController.getAllDepartments);
router.post('/', checkRole(['admin']), departmentsController.createDepartment);
router.put('/:id', checkRole(['admin']), departmentsController.updateDepartment);
router.delete('/:id', checkRole(['admin']), departmentsController.deleteDepartment);

module.exports = router;
