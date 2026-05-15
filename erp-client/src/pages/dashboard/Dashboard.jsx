import React from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Building2,
  Calendar,
  Wallet,
  ArrowRight,
  PlusCircle,
  LogIn
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useClockIn, useMyAttendance, useAttendance } from '../../hooks/useAttendance';
import { useEmployees } from '../../hooks/useEmployees';
import { usePendingLeaves, useLeaveBalances } from '../../hooks/useLeave';
import { useDepartments } from '../../hooks/useDepartments';
import { useAttendanceTrends, useLeaveSummary, useDepartmentDistribution } from '../../hooks/useDashboard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, 
  BarChart, Bar 
} from 'recharts';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isAdminOrHR = ['admin', 'hr_manager'].includes(user?.role);
  
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { data: allAttendance, isLoading: allAttendanceLoading } = useAttendance();
  const { data: myAttendanceHistory, isLoading: myAttendanceLoading } = useMyAttendance();
  const { data: allLeaves, isLoading: leavesLoading } = usePendingLeaves();
  const { data: myBalances, isLoading: balancesLoading } = useLeaveBalances();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const { data: attendanceTrends, isLoading: trendsLoading } = useAttendanceTrends({ enabled: isAdminOrHR });
  const { data: leaveSummary, isLoading: leaveSummaryLoading } = useLeaveSummary({ enabled: isAdminOrHR });
  const { data: deptDist, isLoading: deptDistLoading } = useDepartmentDistribution({ enabled: isAdminOrHR });

  const COLORS = {
    present: '#10b981',
    absent: '#ef4444',
    half_day: '#f59e0b',
    casual_leave: '#3b82f6',
    sick_leave: '#f97316',
    earned_leave: '#84cc16'
  };

  const leavePieData = leaveSummary ? [
    { name: 'Casual Leave', value: leaveSummary.casual_leave?.taken || 0, fill: COLORS.casual_leave },
    { name: 'Sick Leave', value: leaveSummary.sick_leave?.taken || 0, fill: COLORS.sick_leave },
    { name: 'Earned Leave', value: leaveSummary.earned_leave?.taken || 0, fill: COLORS.earned_leave }
  ] : [];

  const toLocalDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayDate = toLocalDateString(new Date());
  
  const todayAttendanceCount = allAttendance?.filter(record => 
    toLocalDateString(record.work_date) === todayDate
  ).length || 0;

  const myTodayAttendance = myAttendanceHistory?.find(record => 
    toLocalDateString(record.work_date) === todayDate
  );

  const pendingLeavesCount = allLeaves?.filter(l => l.status === 'pending').length || 0;

  const { mutate: clockIn, isPending: isClockingIn } = useClockIn();

  const statCards = isAdminOrHR ? [
    { 
      label: 'Total Employees', 
      value: employees?.length || 0, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      loading: employeesLoading
    },
    { 
      label: 'Present Today', 
      value: todayAttendanceCount, 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      loading: allAttendanceLoading
    },
    { 
      label: 'Pending Leaves', 
      value: pendingLeavesCount, 
      icon: Clock, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      loading: leavesLoading
    },
    { 
      label: 'Departments', 
      value: departments?.length || 0, 
      icon: Building2, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      loading: departmentsLoading
    },
  ] : [
    { 
      label: 'My Present Days', 
      value: myAttendanceHistory?.length || 0, 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      loading: myAttendanceLoading
    },
    { 
      label: 'My Leave Balance', 
      value: myBalances?.reduce((sum, b) => sum + parseFloat(b.pending_days), 0).toFixed(1) || 0, 
      icon: Calendar, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      loading: balancesLoading
    }
  ];

  const activityData = isAdminOrHR ? allAttendance : myAttendanceHistory;
  const activityLoading = isAdminOrHR ? allAttendanceLoading : myAttendanceLoading;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome back, <span className="text-primary-600">{user?.first_name} {user?.last_name}!</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {isAdminOrHR ? "Here's what's happening with your HR portal today." : "Manage your daily tasks and check your status here."}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary-50 rounded-full -mr-20 -mt-20 opacity-50"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {card.loading ? <div className="h-9 w-16 bg-gray-100 animate-pulse rounded"></div> : card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section - Only visible to Admins/HR */}
      {isAdminOrHR && (
        <div className="space-y-6">
          {/* Attendance Trends */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Attendance Trends (Last 7 Days)</h2>
            {trendsLoading ? (
              <div className="h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
            ) : attendanceTrends && attendanceTrends.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="present" name="Present" stroke={COLORS.present} strokeWidth={3} dot={{ strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="absent" name="Absent" stroke={COLORS.absent} strokeWidth={3} dot={{ strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="half_day" name="Half Day" stroke={COLORS.half_day} strokeWidth={3} dot={{ strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No attendance data available</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Usage Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Leave Usage Across Company</h2>
              {leaveSummaryLoading ? (
                <div className="h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
              ) : leaveSummary ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leavePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {leavePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No leave data available</div>
              )}
            </div>

            {/* Department Distribution Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Employees by Department</h2>
              {deptDistLoading ? (
                <div className="h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
              ) : deptDist && deptDist.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" name="Employees" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No department data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button 
                variant={myTodayAttendance ? "secondary" : "primary"}
                className="w-full gap-2 h-12 rounded-xl"
                onClick={() => clockIn()}
                disabled={!!myTodayAttendance}
                isLoading={isClockingIn}
              >
                <LogIn size={18} />
                {myTodayAttendance ? 'Clocked In' : 'Clock In'}
              </Button>
              <Button 
                variant="secondary" 
                className="w-full gap-2 h-12 rounded-xl border-gray-200"
                onClick={() => navigate('/leave/request')}
              >
                <PlusCircle size={18} />
                Apply Leave
              </Button>
              <Button 
                variant="secondary" 
                className="w-full gap-2 h-12 rounded-xl border-gray-200"
                onClick={() => navigate('/payroll')}
              >
                <Wallet size={18} />
                View Payslip
              </Button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {isAdminOrHR ? "Recent Employee Activity" : "My Recent Attendance"}
              </h2>
              <button 
                onClick={() => navigate('/attendance')}
                className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-6">
              {activityData?.slice(0, 5).map((record, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {i !== 4 && <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <CheckCircle size={20} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">
                        {isAdminOrHR ? `${record.first_name} ${record.last_name}` : "Checked In"}
                      </p>
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(record.work_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Clocked in at <span className="font-medium text-gray-900">{new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>
              ))}
              {(!activityData || activityData.length === 0) && !activityLoading && (
                <p className="text-center py-8 text-gray-400">No recent activity found.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          {/* Leave Balance Summary */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Leave Balances</h2>
            <div className="space-y-4">
              {myBalances?.map((balance, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 capitalize">{balance.leave_type_name}</span>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      {balance.pending_days} left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary-600 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (balance.used_days / balance.allocated_days) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                    {balance.used_days} days used of {balance.allocated_days}
                  </p>
                </div>
              ))}
              {(!myBalances || myBalances.length === 0) && !balancesLoading && (
                <p className="text-sm text-gray-400 text-center py-4">No balances found.</p>
              )}
            </div>
          </section>

          {/* Holiday Card */}
          <section className="bg-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-100 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4">Upcoming Holiday</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase">Aug</span>
                  <span className="text-lg">15</span>
                </div>
                <div>
                  <p className="font-bold">Independence Day</p>
                  <p className="text-sm text-primary-100">National Holiday</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
              <Calendar size={120} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
