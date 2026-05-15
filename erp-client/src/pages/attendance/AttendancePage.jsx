import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { getMyAttendance, getEmployeeAttendance, clockIn, clockOut } from '../../api/attendance.api';
import { Clock, Download, Search, User } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';

const AttendancePage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr_manager';
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', selectedEmployeeId || 'me'],
    queryFn: async () => {
      if (selectedEmployeeId) {
        const response = await getEmployeeAttendance(selectedEmployeeId);
        return response.data.data;
      }
      const response = await getMyAttendance();
      return response.data.data;
    }
  });

  const toLocalDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayDate = toLocalDateString(new Date());
  const todayRecord = attendance?.find(record => 
    toLocalDateString(record.work_date) === todayDate
  );
  const isClockedIn = !!todayRecord?.check_in;
  const isClockedOut = !!todayRecord?.check_out;

  const { data: employees } = useQuery({
    queryKey: ['employees-search', searchTerm],
    queryFn: async () => {
      const response = await api.get('/employees', { params: { search: searchTerm } });
      return response.data.data;
    },
    enabled: isAdmin && searchTerm.length > 2
  });

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      toast.success('Clocked in successfully');
      queryClient.invalidateQueries(['attendance', 'today-attendance']);
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      toast.success('Clocked out successfully');
      queryClient.invalidateQueries(['attendance', 'today-attendance']);
    }
  });

  const columns = [
    { header: 'Date', accessor: 'work_date', render: (row) => new Date(row.work_date).toLocaleDateString() },
    { header: 'Clock In', accessor: 'check_in', render: (row) => row.check_in ? new Date(row.check_in).toLocaleTimeString() : '-' },
    { header: 'Clock Out', accessor: 'check_out', render: (row) => row.check_out ? new Date(row.check_out).toLocaleTimeString() : '-' },
    { header: 'Total Hours', accessor: 'work_hours', render: (row) => row.work_hours ? `${row.work_hours} hrs` : '-' },
    { header: 'Status', accessor: 'status', render: (row) => <Badge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedEmployeeId ? 'Employee Attendance' : 'My Attendance'}
          </h1>
          <p className="text-gray-500">Track daily working hours and presence</p>
        </div>
        {!selectedEmployeeId && (
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => clockInMutation.mutate()}
              disabled={isClockedIn}
              isLoading={clockInMutation.isPending}
            >
              <Clock size={18} />
              Clock In
            </Button>
            <Button 
              variant="danger" 
              className="gap-2"
              onClick={() => clockOutMutation.mutate()}
              disabled={!isClockedIn || isClockedOut}
              isLoading={clockOutMutation.isPending}
            >
              <Clock size={18} />
              Clock Out
            </Button>
          </div>
        )}
        {selectedEmployeeId && (
          <Button variant="secondary" onClick={() => setSelectedEmployeeId(null)}>
            View My Attendance
          </Button>
        )}
      </div>

      {isAdmin && (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Admin: Search employee to view their attendance..."
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg. Working Hours</p>
            <h3 className="text-xl font-bold">8.5 hrs</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Badge status="present" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Present Days</p>
            <h3 className="text-xl font-bold">22 Days</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Badge status="absent" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Absents</p>
            <h3 className="text-xl font-bold">1 Day</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
          <Button variant="secondary" className="gap-2 text-xs h-8">
            <Download size={14} />
            Export
          </Button>
        </div>
        <Table 
          columns={columns} 
          data={attendance || []} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default AttendancePage;
