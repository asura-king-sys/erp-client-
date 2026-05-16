const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const employeeRoutes = require('./modules/employees/employees.routes');
const departmentRoutes = require('./modules/departments/departments.routes');
const designationRoutes = require('./modules/designations/designations.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const leaveRoutes = require('./modules/leave/leave.routes');
const payrollRoutes = require('./modules/payroll/payroll.routes');
const documentRoutes = require('./modules/documents/documents.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'HR & Employee Management API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

module.exports = app;
