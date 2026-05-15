const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const auth = require('../../middlewares/auth');
const { checkRole } = require('../../middlewares/role');

router.use(auth);

// Only admins and HR managers can access the dashboard analytics
router.get('/attendance-trends', checkRole(['admin', 'hr_manager']), dashboardController.getAttendanceTrends);
router.get('/leave-summary', checkRole(['admin', 'hr_manager']), dashboardController.getLeaveSummary);
router.get('/department-distribution', checkRole(['admin', 'hr_manager']), dashboardController.getDepartmentDistribution);

module.exports = router;
