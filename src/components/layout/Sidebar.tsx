import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Sparkles,
  BarChart,
  Settings,
  LogOut,
  BookOpenCheck,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r p-4">
      <div className="flex items-center gap-2 mb-8">
        <BookOpenCheck className="h-6 w-6 text-amber-500" />
        <span className="text-xl font-bold">Ai Book Legacy Generation</span>
      </div>

      <nav className="space-y-2">
      <NavLink
          to="/home"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md ${
              isActive ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'
            }`
          }
        >
          <BarChart className="mr-2 h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/books"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md ${
              isActive ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'
            }`
          }
        >
          <BookOpen className="mr-2 h-4 w-4" />
          My Books
        </NavLink>
        <NavLink
          to="/ai-assistant"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md ${
              isActive ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'
            }`
          }
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Assistant
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md ${
              isActive ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'
            }`
          }
        >
          <BarChart className="mr-2 h-4 w-4" />
          Analytics
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-2 p-2 rounded-md ${
              isActive ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100'
            }`
          }
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </NavLink>
      </nav>

      <div className="absolute bottom-4 w-[calc(100%-2rem)]">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
