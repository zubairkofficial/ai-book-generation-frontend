import  { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen bg-gray-50 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:ml-64" : "md:ml-0",
          "p-4 md:p-8"
        )}
      >
        {/* Top Navigation Bar */}
       

        {/* Page Content */}
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb - optional */}
          <div className="mb-6 text-sm text-gray-500">
            <nav className="flex" aria-label="Breadcrumb">
              {/* Add your breadcrumb navigation here if needed */}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 py-4">
          <p>© 2025 AI Book Legacy. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
