const express = require('express');
const router = express.Router();
const documentsController = require('./documents.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.post('/', checkRole(['admin', 'hr_manager']), documentsController.uploadDocument);
router.get('/:employeeId', checkRole(['admin', 'hr_manager', 'employee']), documentsController.getEmployeeDocuments);
router.delete('/:id', checkRole(['admin', 'hr_manager']), documentsController.deleteDocument);

module.exports = router;
