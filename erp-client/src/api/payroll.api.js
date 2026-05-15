import api from './axios';

export const getMyPayslips = () => api.get('/payroll/payslips/me');
export const getEmployeePayslips = (id) => api.get(`/payroll/payslips/${id}`);
export const getSalaryStructure = (employeeId) => api.get(`/payroll/salary/${employeeId}`);
export const createOrUpdateSalaryStructure = (data) => api.post('/payroll/salary', data);
export const generatePayslip = (data) => api.post('/payroll/payslips/generate', data);
