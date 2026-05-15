import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ChevronLeft, Save } from 'lucide-react';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await api.get(`/employees/${id}`);
      return response.data.data;
    },
    enabled: isEdit
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data;
    }
  });

  const { data: designations } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const response = await api.get('/designations');
      return response.data.data;
    }
  });

  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        date_of_birth: employee.date_of_birth?.split('T')[0],
        joining_date: employee.joining_date?.split('T')[0],
      });
    }
  }, [employee, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return api.put(`/employees/${id}`, data);
      }
      return api.post('/employees', data);
    },
    onSuccess: () => {
      toast.success(`Employee ${isEdit ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries(['employees']);
      navigate('/employees');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEdit && empLoading) return <div className="h-64 flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-gray-500">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h3 className="col-span-full text-lg font-semibold text-gray-900 border-b pb-2 mb-2">Personal Information</h3>
            
            <Input 
              label="First Name" 
              {...register('first_name', { required: 'First name is required' })}
              error={errors.first_name}
            />
            
            <Input 
              label="Last Name" 
              {...register('last_name', { required: 'Last name is required' })}
              error={errors.last_name}
            />

            <Input 
              label="Email Address" 
              type="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email}
            />

            <Input 
              label="Phone Number" 
              {...register('phone')}
            />

            <Input 
              label="Date of Birth" 
              type="date"
              {...register('date_of_birth', { required: 'DOB is required' })}
              error={errors.date_of_birth}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select className="input" {...register('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <h3 className="col-span-full text-lg font-semibold text-gray-900 border-b pb-2 mb-2 mt-4">Professional Details</h3>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select className="input" {...register('department_id', { required: 'Required' })}>
                <option value="">Select Department</option>
                {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.department_id && <p className="text-xs text-red-500 mt-1">{errors.department_id.message}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <select className="input" {...register('designation_id', { required: 'Required' })}>
                <option value="">Select Designation</option>
                {designations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.designation_id && <p className="text-xs text-red-500 mt-1">{errors.designation_id.message}</p>}
            </div>

            <Input 
              label="Joining Date" 
              type="date"
              {...register('joining_date', { required: 'Required' })}
              error={errors.joining_date}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select className="input" {...register('employment_type')}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/employees')}>Cancel</Button>
            <Button type="submit" isLoading={mutation.isPending} className="gap-2 px-8">
              <Save size={18} />
              {isEdit ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
