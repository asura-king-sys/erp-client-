import api from './axios';

export const getLeaveTypes = () => api.get('/leave/types');
export const createLeaveType = (data) => api.post('/leave/types', data);

export const getMyBalances = () => api.get('/leave/balances/me');
export const getEmployeeBalances = (employeeId) => api.get(`/leave/balances/${employeeId}`);

export const createLeaveRequest = (data) => api.post('/leave/requests', data);
export const getMyLeaveRequests = () => api.get('/leave/requests/me');
export const getAllLeaveRequests = () => api.get('/leave/requests');

export const approveLeave = (id) => api.put(`/leave/requests/${id}/approve`);
export const rejectLeave = (id) => api.put(`/leave/requests/${id}/reject`);
