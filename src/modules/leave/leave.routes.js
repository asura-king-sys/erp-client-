const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.get('/types', leaveController.getLeaveTypes);
router.post('/types', checkRole(['admin']), leaveController.createLeaveType);

router.get('/balances/me', leaveController.getMyBalances);
router.get('/balances/:employeeId', checkRole(['admin', 'hr_manager']), leaveController.getEmployeeBalances);

router.post('/requests', leaveController.requestLeave);
router.get('/requests/me', leaveController.getMyRequests);
router.get('/requests', checkRole(['admin', 'hr_manager']), leaveController.getAllRequests);

router.put('/requests/:id/approve', checkRole(['admin', 'hr_manager']), leaveController.approveLeave);
router.put('/requests/:id/reject', checkRole(['admin', 'hr_manager']), leaveController.rejectLeave);

module.exports = router;
