import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Sparkles,
  BarChart,
  Settings,
  LogOut,
  BookOpenCheck,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const trimText = (trimmedText:string, number: number) => {
   if(trimmedText.length > number)
    return trimmedText.substring(0, number)+"...";
  return trimmedText;
  };
  const navItems = [
    { path: '/home', icon: <Home className="h-4 w-4" />, label: 'Home' },
    { path: '/books', icon: <BookOpen className="h-4 w-4" />, label: 'My Books' },
    { path: '/ai-assistant', icon: <Sparkles className="h-4 w-4" />, label: 'AI Assistant' },
    { path: '/analytics', icon: <BarChart className="h-4 w-4" />, label: 'Analytics' },
    { path: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r shadow-lg z-40 transition-transform duration-300 ease-in-out",
          "w-64 transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-amber-500" />
            <span className="text-lg font-bold">AI Book Legacy</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-amber-50 active:bg-amber-100",
                  "font-medium text-gray-600 hover:text-amber-600",
                  isActive && "bg-amber-100 text-amber-600"
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="mb-4 p-3 rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 break-words ">{trimText(user?.email??"",20)}</p>
              </div>
            </div>
          </div>
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
    </>
  );
};

export default Sidebar;
