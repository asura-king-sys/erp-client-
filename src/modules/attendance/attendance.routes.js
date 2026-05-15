const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/me', attendanceController.getMyAttendance);
router.get('/', checkRole(['admin', 'hr_manager']), attendanceController.getAllAttendance);
router.get('/:employeeId', checkRole(['admin', 'hr_manager']), attendanceController.getEmployeeAttendance);

module.exports = router;
