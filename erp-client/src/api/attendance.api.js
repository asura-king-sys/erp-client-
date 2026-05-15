import api from './axios';

export const getMyAttendance = () => api.get('/attendance/me');
export const getAllAttendance = () => api.get('/attendance');
export const getEmployeeAttendance = (id) => api.get(`/attendance/${id}`);
export const clockIn = () => api.post('/attendance/clock-in');
export const clockOut = () => api.post('/attendance/clock-out');
