import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Search, Plus, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', searchTerm, deptFilter],
    queryFn: async () => {
      const response = await api.get('/employees', {
        params: { search: searchTerm, department: deptFilter }
      });
      return response.data.data;
    }
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/employees/${deleteId}`);
      toast.success('Employee deleted successfully');
      queryClient.invalidateQueries(['employees']);
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data;
    }
  });

  const columns = [
    { header: 'Emp Code', accessor: 'employee_code' },
    { 
      header: 'Name', 
      accessor: 'first_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div>
            <div className="font-medium">{row.first_name} {row.last_name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department_name' },
    { header: 'Designation', accessor: 'designation_name' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/employees/${row.id}`)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          {(isAdmin || user?.role === 'hr_manager') && (
            <button 
              onClick={() => navigate(`/employees/${row.id}/edit`)}
              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
              title="Edit Employee"
            >
              <Edit2 size={18} />
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => setDeleteId(row.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Employee"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500">Manage your workforce efficiently</p>
        </div>
        {isAdmin && (
          <Button 
            className="gap-2"
            onClick={() => navigate('/employees/new')}
          >
            <Plus size={18} />
            Add Employee
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or code..."
            className="input pl-11 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="input min-w-[200px] h-11"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments?.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <Button variant="secondary" className="gap-2 h-11 whitespace-nowrap px-6">
            <Filter size={18} />
            More Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          data={employees || []} 
          isLoading={isLoading} 
        />
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this employee? This action cannot be undone and will remove all associated records.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              isLoading={isDeleting}
            >
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
