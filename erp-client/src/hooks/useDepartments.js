import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as departmentsApi from '../api/departments.api';
import { toast } from 'react-hot-toast';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments().then(res => res.data.data),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast.success('Department created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  });
};
