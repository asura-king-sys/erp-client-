import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Plus } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const DepartmentList = () => {
  const { user } = useAuthContext();
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data;
    }
  });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Manager', accessor: 'manager_name', render: (row) => row.manager_name || 'Not Assigned' },
    { header: 'Total Employees', accessor: 'employee_count' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500">Manage organization structure</p>
        </div>
        {user?.role === 'admin' && (
          <Button className="gap-2">
            <Plus size={18} />
            Create Department
          </Button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={departments || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DepartmentList;
