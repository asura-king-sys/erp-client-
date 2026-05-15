import React from 'react';
import { LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome back, {user?.first_name}!
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
