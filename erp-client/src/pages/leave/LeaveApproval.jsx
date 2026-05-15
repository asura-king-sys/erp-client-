import React from 'react';
import { usePendingLeaves, useUpdateLeaveStatus } from '../../hooks/useLeave';
import { Check, X } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { toast } from 'react-hot-toast';

const LeaveApproval = () => {
  const { data: requests, isLoading } = usePendingLeaves();
  const { mutate: updateStatus, isPending } = useUpdateLeaveStatus();

  const handleAction = (id, status) => {
    // For rejection, we could optionally prompt for a reason
    const reason = status === 'rejected' ? window.prompt('Enter reason for rejection:') : null;
    if (status === 'rejected' && reason === null) return; // User cancelled prompt
    
    updateStatus({ id, status, reason });
  };

  const columns = [
    { 
      header: 'Employee', 
      accessor: 'employee_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
            {row.first_name?.[0] || 'E'}
          </div>
          <span className="font-medium text-gray-900">{row.first_name} {row.last_name}</span>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessor: 'leave_type',
      render: (row) => <span className="capitalize">{row.leave_type_name}</span>
    },
    { header: 'Dates', accessor: 'from_date', render: (row) => (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{new Date(row.from_date).toLocaleDateString()}</div>
        <div className="text-gray-400 text-xs">to {new Date(row.to_date).toLocaleDateString()}</div>
      </div>
    )},
    { header: 'Days', accessor: 'days_requested', render: (row) => <span className="font-medium">{row.days_requested}</span> },
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
          {row.status === 'pending' ? (
            <>
              <button 
                onClick={() => handleAction(row.id, 'approved')}
                disabled={isPending}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                title="Approve"
              >
                <Check size={20} />
              </button>
              <button 
                onClick={() => handleAction(row.id, 'rejected')}
                disabled={isPending}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                title="Reject"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No actions</span>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
        <p className="text-gray-500">Review and action leave requests from employees</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          data={requests || []} 
          isLoading={isLoading} 
          emptyMessage="No leave requests found" 
        />
      </div>
    </div>
  );
};

export default LeaveApproval;
