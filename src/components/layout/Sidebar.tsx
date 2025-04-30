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
  CreditCard,
  Package,
  Users,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';
import { useUserMeQuery } from '@/api/userApi';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const dispatch = useDispatch();
  const { data:user } = useUserMeQuery();

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
    ...(user?.role === 'user' ?[
    { path: '/payment', icon: <CreditCard className="h-4 w-4" />, label: 'Recharge' },
    { path: '/subscription', icon: <Package className="h-4 w-4" />, label: 'Subscription Plans' },
 ]:[]),
    // Conditionally include admin links for admin users
    ...(user?.role === 'admin' 
      ? [
          { path: '/analytics', icon: <BarChart className="h-4 w-4" />, label: 'User Analytics' },
          { path: '/admin/packages', icon: <Package className="h-4 w-4" />, label: 'Manage Packages' },
          { path: '/free-subscriptions', icon: <Users className="h-4 w-4" />, label: 'Free Subscriptions' },
        ] 
      : []),
    { path: '/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Improved Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Optimized Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-md border-r shadow-lg z-40",
          "w-60 transform transition-all duration-300 ease-out",
          "md:translate-x-0 md:hover:shadow-xl md:hover:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Compact Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 transform hover:scale-102 transition-transform duration-200">
            <BookOpenCheck className="h-6 w-6 text-amber-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              AI Book Legacy
            </span>
          </div>
        </div>

        {/* Streamlined Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Only close sidebar on mobile views
                if (window.innerWidth < 768) {
                  setIsOpen(false);
                }
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-amber-50/80 active:bg-amber-100",
                  "font-medium text-sm text-gray-600 hover:text-amber-600",
                  "group hover:shadow-sm",
                  isActive && "bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-600 shadow-sm"
                )
              }
            >
              <span className="group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Compact User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-gradient-to-b from-transparent to-gray-50/80">
          <div className="mb-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
                <span className="text-amber-600 font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {trimText(user?.email ?? "", 18)}
                </p>
                {user?.role=="user" && <div className="mt-1 flex items-center gap-1.5 bg-amber-50 rounded-md px-2 py-0.5">
                  <CreditCard className="h-3 w-3 text-amber-600" />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-gray-600">Balance:</span>
                    <span className="text-xs font-medium text-amber-700">
                      {user?.availableAmount?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }) ?? '0.00'}
                    </span>
                  </div>
                </div>}
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-lg py-2 text-sm"
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
