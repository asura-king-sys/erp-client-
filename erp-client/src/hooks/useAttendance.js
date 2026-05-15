import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as attendanceApi from '../api/attendance.api';
import { toast } from 'react-hot-toast';

export const useMyAttendance = () => {
  return useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => attendanceApi.getMyAttendance().then(res => res.data.data),
  });
};

export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getAllAttendance().then(res => res.data.data),
  });
};


export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-attendance']);
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['today-attendance']);
      toast.success('Clocked in successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Clock in failed');
    }
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-attendance']);
      queryClient.invalidateQueries(['attendance']);
      queryClient.invalidateQueries(['today-attendance']);
      toast.success('Clocked out successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Clock out failed');
    }
  });
};

