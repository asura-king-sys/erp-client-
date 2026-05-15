import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { getSalaryStructure, createOrUpdateSalaryStructure } from '../../api/payroll.api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { DollarSign, Edit, Search } from 'lucide-react';

const SalaryStructure = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-salary', searchTerm],
    queryFn: async () => {
      const response = await api.get('/employees', { params: { search: searchTerm } });
      return response.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: createOrUpdateSalaryStructure,
    onSuccess: () => {
      toast.success('Salary structure updated successfully');
      setIsModalOpen(false);
      reset();
      queryClient.invalidateQueries(['employees-salary']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  const handleEdit = async (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    try {
      const response = await getSalaryStructure(employee.id);
      const data = response.data.data;
      if (data) {
        setValue('base_salary', data.base_salary);
        setValue('house_rent_allowance', data.house_rent_allowance);
        setValue('conveyance_allowance', data.conveyance_allowance);
        setValue('medical_allowance', data.medical_allowance);
        setValue('other_allowance', data.other_allowance);
      } else {
        reset({ base_salary: 0, house_rent_allowance: 0, conveyance_allowance: 0, medical_allowance: 0, other_allowance: 0 });
      }
    } catch (error) {
      reset({ base_salary: 0, house_rent_allowance: 0, conveyance_allowance: 0, medical_allowance: 0, other_allowance: 0 });
    }
  };

  const onSubmit = (data) => {
    mutation.mutate({ ...data, employee_id: selectedEmployee.id });
  };

  const columns = [
    { header: 'Emp Code', accessor: 'employee_code' },
    { header: 'Name', accessor: 'first_name', render: (row) => `${row.first_name} ${row.last_name}` },
    { header: 'Department', accessor: 'department_name' },
    { header: 'Designation', accessor: 'designation_name' },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (row) => (
        <Button 
          variant="secondary" 
          className="gap-2 text-xs h-8"
          onClick={() => handleEdit(row)}
        >
          <DollarSign size={14} />
          Manage Salary
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Configuration</h1>
          <p className="text-gray-500">Manage individual employee salary structures</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search employee to manage salary..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={employees || []} isLoading={isLoading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Salary Structure: ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Base Salary" 
              type="number" 
              {...register('base_salary', { required: 'Required', min: 0 })} 
              error={errors.base_salary} 
            />
            <Input 
              label="House Rent Allowance (HRA)" 
              type="number" 
              {...register('house_rent_allowance', { min: 0 })} 
              error={errors.house_rent_allowance} 
            />
            <Input 
              label="Conveyance Allowance" 
              type="number" 
              {...register('conveyance_allowance', { min: 0 })} 
              error={errors.conveyance_allowance} 
            />
            <Input 
              label="Medical Allowance" 
              type="number" 
              {...register('medical_allowance', { min: 0 })} 
              error={errors.medical_allowance} 
            />
            <Input 
              label="Other Allowances" 
              type="number" 
              {...register('other_allowance', { min: 0 })} 
              error={errors.other_allowance} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={mutation.isPending}>Save Configuration</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryStructure;
