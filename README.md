# HR & Employee Management Backend

Complete backend for the HR module of a PERN stack ERP system.

## Tech Stack
- **Node.js** with **Express**
- **PostgreSQL** with **pg** library
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** & **cors** for security

## Setup Instructions

1. **Clone the repository** (if applicable).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and copy the contents from `.env.example`. Update the database credentials and JWT secret.
4. **Database Setup**:
   Ensure PostgreSQL is running and the database `erp_hr_db` exists. Run migrations if necessary.
5. **Start the server**:
   - For development: `npm run dev`
   - For production: `npm start`

## API Endpoints

### Auth
- `POST /api/auth/login`: Login with email and password. Returns JWT.
- `POST /api/auth/logout`: Logout (client-side removal recommended).
- `GET /api/auth/me`: Get current user profile.

### Employees
- `GET /api/employees`: List all employees (Admin/HR only). Supports `?dept=` and `?status=` filters.
- `GET /api/employees/:id`: Get single employee details.
- `POST /api/employees`: Create employee and auto-create user account.
- `PUT /api/employees/:id`: Update employee details.
- `DELETE /api/employees/:id`: Terminate employee (soft delete).

### Departments & Designations
- `GET /api/departments`: List all departments.
- `POST /api/departments`: Create department (Admin only).
- `GET /api/designations`: List all designations.
- `POST /api/designations`: Create designation (Admin only).

### Attendance
- `POST /api/attendance/clock-in`: Clock in for the day.
- `POST /api/attendance/clock-out`: Clock out and calculate work hours.
- `GET /api/attendance/me`: View personal attendance history.
- `GET /api/attendance/:employeeId`: View employee attendance (Admin/HR).

### Leave
- `GET /api/leave/types`: List leave types.
- `GET /api/leave/balances/me`: View personal leave balances.
- `POST /api/leave/requests`: Submit a leave request.
- `PUT /api/leave/requests/:id/approve`: Approve leave request (Admin/HR).
- `PUT /api/leave/requests/:id/reject`: Reject leave request (Admin/HR).

### Payroll
- `GET /api/payroll/salary/:employeeId`: Get employee salary structure.
- `POST /api/payroll/salary`: Create or update salary structure.
- `POST /api/payroll/payslips/generate`: Generate payslip for a specific month and year.
- `GET /api/payroll/payslips/me`: View personal payslips.

### Documents
- `POST /api/documents`: Upload document record.
- `GET /api/documents/:employeeId`: List employee documents.
- `DELETE /api/documents/:id`: Delete document record.

## Middleware Rules
- **Authentication**: JWT required for all routes except login.
- **RBAC**: 
  - `admin`: Full access.
  - `hr_manager`: Access to all employee data, but cannot delete or change roles.
  - `employee`: Access to personal records only (attendance, leave, payslips).
