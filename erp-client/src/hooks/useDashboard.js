import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useAttendanceTrends = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'attendance-trends'],
    queryFn: async () => {
      const response = await api.get('/dashboard/attendance-trends');
      return response.data.data;
    },
    ...options
  });
};

export const useLeaveSummary = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'leave-summary'],
    queryFn: async () => {
      const response = await api.get('/dashboard/leave-summary');
      return response.data.data;
    },
    ...options
  });
};

export const useDepartmentDistribution = (options = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'department-distribution'],
    queryFn: async () => {
      const response = await api.get('/dashboard/department-distribution');
      return response.data.data;
    },
    ...options
  });
};

