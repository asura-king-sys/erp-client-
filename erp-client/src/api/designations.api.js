import api from './axios';

export const getDesignations = () => api.get('/designations');
