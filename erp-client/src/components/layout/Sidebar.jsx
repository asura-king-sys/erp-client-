import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText, 
  Wallet, 
  UserCheck,
  ClipboardList
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuthContext();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      roles: ['admin', 'hr_manager', 'employee'] 
    },
    { 
      name: 'Employees', 
      path: '/employees', 
      icon: Users, 
      roles: ['admin', 'hr_manager'] 
    },
    { 
      name: 'Departments', 
      path: '/departments', 
      icon: Building2, 
      roles: ['admin', 'hr_manager'] 
    },
    { 
      name: 'Attendance', 
      path: '/attendance', 
      icon: CalendarCheck, 
      roles: ['admin', 'hr_manager', 'employee'] 
    },
    { 
      name: 'Leave Management', 
      path: '/leave', 
      icon: FileText, 
      roles: ['admin', 'hr_manager', 'employee'] 
    },
    { 
      name: 'Leave Approval', 
      path: '/leave/approve', 
      icon: UserCheck, 
      roles: ['hr_manager'] 
    },
    { 
      name: 'Payroll', 
      path: '/payroll', 
      icon: Wallet, 
      roles: ['admin', 'hr_manager', 'employee'] 
    },
    { 
      name: 'Salary Structure', 
      path: '/payroll/salary', 
      icon: ClipboardList, 
      roles: ['admin'] 
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">HR</span>
        </div>
        <span className="text-xl font-bold text-gray-900">ERP System</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LayoutDashboard size={18} className="rotate-180" /> {/* Using rotate-180 of dashboard icon as a simple logout symbol or just use LogOut if available */}
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
