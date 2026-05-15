import React from 'react';
import { useLeaveBalances, useMyLeaveRequests } from '../../hooks/useLeave';
import { Calendar, Plus } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

const LeaveBalance = () => {
  const navigate = useNavigate();
  const { data: balances, isLoading: balanceLoading } = useLeaveBalances();
  const { data: requests, isLoading: requestsLoading } = useMyLeaveRequests();

  const columns = [
    { 
      header: 'Type', 
      accessor: 'leave_type_name',
      render: (row) => <span className="capitalize">{row.leave_type_name}</span>
    },
    { header: 'From', accessor: 'from_date', render: (row) => new Date(row.from_date).toLocaleDateString() },
    { header: 'To', accessor: 'to_date', render: (row) => new Date(row.to_date).toLocaleDateString() },
    { header: 'Reason', accessor: 'reason', render: (row) => <span className="max-w-xs truncate block text-gray-600">{row.reason}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">View your balances and track your leave requests</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/leave/request')}>
          <Plus size={18} />
          Apply for Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {balances?.map((b, i) => {
          const allocated = parseFloat(b.allocated_days) || 0;
          const used = parseFloat(b.used_days) || 0;
          const pending = parseFloat(b.pending_days) || 0;
          const remaining = allocated - used - pending;

          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar size={64} />
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{b.leave_type_name}</p>
              <div className="flex items-end gap-2 mt-2">
                <h3 className="text-3xl font-bold text-gray-900">{remaining.toFixed(2)}</h3>
                <p className="text-sm text-gray-400 mb-1">/ {allocated} days left</p>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${allocated > 0 ? Math.min(100, (used / allocated) * 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{used.toFixed(2)} days used this year</p>
            </div>
          );
        })}
        {(!balances || balances.length === 0) && !balanceLoading && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400">No leave balances found.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">My Leave Requests</h2>
        </div>
        <Table columns={columns} data={requests || []} isLoading={requestsLoading} />
      </div>
    </div>
  );
};

export default LeaveBalance;
