import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { getMyPayslips, getEmployeePayslips } from '../../api/payroll.api';
import { FileText, Download, Eye, Search, Plus } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuthContext } from '../../context/AuthContext';

const PayslipList = () => {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr_manager';
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: payslips, isLoading } = useQuery({
    queryKey: ['payslips', selectedEmployeeId || 'me'],
    queryFn: async () => {
      if (selectedEmployeeId) {
        const response = await getEmployeePayslips(selectedEmployeeId);
        return response.data.data;
      }
      const response = await getMyPayslips();
      return response.data.data;
    }
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-search-payslip', searchTerm],
    queryFn: async () => {
      const response = await api.get('/employees', { params: { search: searchTerm } });
      return response.data.data;
    },
    enabled: isAdmin && searchTerm.length > 2
  });

  const downloadPayslip = async (payslipId) => {
    try {
      const response = await api.get(`/payroll/payslips/${payslipId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${payslipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download payslip. Please try again.');
    }
  };

  const columns = [
    { header: 'Month/Year', accessor: 'month', render: (row) => `${row.month}/${row.year}` },
    { header: 'Gross Salary', accessor: 'gross_salary', render: (row) => `$${row.gross_salary?.toLocaleString()}` },
    { header: 'Deductions', accessor: 'total_deductions', render: (row) => <span className="text-red-500">-$${row.total_deductions?.toLocaleString()}</span> },
    { header: 'Net Payable', accessor: 'net_salary', render: (row) => <span className="font-bold text-green-600">$${row.net_salary?.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status} /> },
    { 
      header: 'Actions', 
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="View Details">
            <Eye size={18} />
          </button>
          <button 
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors" 
            title="Download PDF"
            onClick={() => downloadPayslip(row.id)}
          >
            <Download size={18} />
          </button>
        </div>
      )
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedEmployeeId ? 'Employee Payslips' : 'My Payslips'}
          </h1>
          <p className="text-gray-500">View and download monthly salary slips</p>
        </div>
        <div className="flex gap-3">
          {selectedEmployeeId && (
            <Button variant="secondary" onClick={() => setSelectedEmployeeId(null)}>
              Back to My Payslips
            </Button>
          )}
          <select className="input text-sm h-10">
            <option>All Years</option>
            <option>2024</option>
            <option>2023</option>
          </select>
          {user?.role === 'admin' && (
            <Button className="gap-2 whitespace-nowrap">
              <Plus size={18} />
              Generate Payslip
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Admin: Search employee to view their payslips..."
              className="input pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {employees && searchTerm.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b last:border-0"
                  onClick={() => {
                    setSelectedEmployeeId(emp.id);
                    setSearchTerm('');
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{emp.first_name} {emp.last_name}</div>
                    <div className="text-xs text-gray-500">{emp.employee_code} - {emp.department_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Year to Date Gross</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">$45,000</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Last Salary Paid</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">$3,750</h3>
          <p className="text-xs text-gray-400 mt-1">Paid on June 01, 2024</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Tax Deducted (YTD)</p>
          <h3 className="text-2xl font-bold text-red-500 mt-1">$4,500</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={payslips || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default PayslipList;
