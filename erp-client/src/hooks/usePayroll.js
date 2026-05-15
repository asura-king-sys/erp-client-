import { useQuery } from '@tanstack/react-query';
import * as payrollApi from '../api/payroll.api';

export const useMyPayslips = () => {
  return useQuery({
    queryKey: ['my-payslips'],
    queryFn: () => payrollApi.getMyPayslips().then(res => res.data.data),
  });
};

export const useSalaryStructures = () => {
  return useQuery({
    queryKey: ['salary-structures'],
    queryFn: () => payrollApi.getSalaryStructures().then(res => res.data.data),
  });
};

export const usePayslipDetail = (id) => {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payrollApi.getPayslip(id).then(res => res.data.data),
    enabled: !!id,
  });
};
