import api from './axios';

export const getMyDocuments = () => api.get('/documents/my');
export const uploadDocument = (data) => api.post('/documents/upload', data);
