import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import EmployeeForm from './pages/employees/EmployeeForm';
import DepartmentList from './pages/departments/DepartmentList';
import AttendancePage from './pages/attendance/AttendancePage';
import LeaveBalance from './pages/leave/LeaveBalance';
import LeaveRequest from './pages/leave/LeaveRequest';
import LeaveApproval from './pages/leave/LeaveApproval';
import PayslipList from './pages/payroll/PayslipList';
import SalaryStructure from './pages/payroll/SalaryStructure';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Employee Management */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'hr_manager']} />}>
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/departments" element={<DepartmentList />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              <Route path="/payroll/salary" element={<SalaryStructure />} />
            </Route>

            {/* Attendance & Leave */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeaveBalance />} />
            <Route path="/leave/request" element={<LeaveRequest />} />
            <Route path="/payroll" element={<PayslipList />} />
            
            <Route element={<ProtectedRoute allowedRoles={['hr_manager']} />}>
              <Route path="/leave/approve" element={<LeaveApproval />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<div className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-gray-600">Page not found</p>
          <a href="/" className="mt-4 text-primary-600 hover:underline">Go back home</a>
        </div>} />
      </Routes>
    </Router>
  );
};

export default App;
