import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as employeesApi from '../api/employees.api';
import { toast } from 'react-hot-toast';

export const useEmployees = (params) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getEmployees(params).then(res => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: employeesApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success('Employee created');
    },
  });

  return {
    employees: employeesQuery.data,
    isLoading: employeesQuery.isLoading,
    createEmployee: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
