import  { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen flex flex-col">
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
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "md:ml-64" : "md:ml-0",
        "p-4 md:p-2"
      )}
    >
      {/* Top Navigation Bar */}
     
  
      {/* Page Content */}
      <div className="w-full mx-auto">
        {/* Main Content Area */}
        <div className="rounded-lg shadow-sm p-6 md:p-2 mb-12">
          {children}
        </div>
      </div>
    </main>
  
    {/* Footer */}
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-md text-center text-sm text-gray-500 z-10">
      <p> 2025 AI Book Legacy. All rights reserved.</p>
    </footer>
  </div>
  );
};

export default Layout;
