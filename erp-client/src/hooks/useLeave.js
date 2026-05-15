import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as leaveApi from '../api/leave.api';
import { toast } from 'react-hot-toast';

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveApi.getLeaveTypes().then(res => res.data.data),
  });
};

export const useLeaveBalances = () => {
  return useQuery({
    queryKey: ['leave-balances'],
    queryFn: () => leaveApi.getMyBalances().then(res => res.data.data),
  });
};

export const useMyLeaveRequests = () => {
  return useQuery({
    queryKey: ['my-leave-requests'],
    queryFn: () => leaveApi.getMyLeaveRequests().then(res => res.data.data),
  });
};

export const useApplyLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveApi.createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-leave-requests', 'leave-balances']);
      toast.success('Leave request submitted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    }
  });
};

export const usePendingLeaves = () => {
  return useQuery({
    queryKey: ['leaveRequests'],
    queryFn: () => leaveApi.getAllLeaveRequests().then(res => res.data.data),
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) => {
      if (status === 'approved') return leaveApi.approveLeave(id);
      if (status === 'rejected') return leaveApi.rejectLeave(id, reason);
      throw new Error('Invalid status');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      toast.success(`Leave ${variables.status} successfully`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    }
  });
};
