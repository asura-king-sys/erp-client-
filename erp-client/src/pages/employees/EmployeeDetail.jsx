import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { ChevronLeft, Edit2 } from 'lucide-react';
import Button from '../../components/common/Button';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await api.get(`/employees/${id}`);
      return response.data.data;
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <h1 className="text-2xl font-bold">{employee?.first_name} {employee?.last_name}</h1>
        </div>
        <Button onClick={() => navigate(`/employees/${id}/edit`)} className="gap-2">
          <Edit2 size={18} /> Edit Profile
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div><p className="text-xs text-gray-400">Email</p><p className="font-medium">{employee?.email}</p></div>
            <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium">{employee?.phone || '-'}</p></div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Employment Details</h3>
          <div className="space-y-4">
            <div><p className="text-xs text-gray-400">Department</p><p className="font-medium">{employee?.department_name}</p></div>
            <div><p className="text-xs text-gray-400">Joining Date</p><p className="font-medium">{new Date(employee?.joining_date).toLocaleDateString()}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
