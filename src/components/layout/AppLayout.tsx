import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar.tsx';
import { Sidebar } from './Sidebar.tsx';
import { MobileDrawer, BottomNavigation } from './MobileNavbar.tsx';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/70 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navbar */}
      <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Body Area: Desktop Sidebar + Page Content */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (visible on md+) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-[61px] h-[calc(100vh-61px)]">
            <Sidebar />
          </div>
        </div>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (visible on < md) */}
      <BottomNavigation />
    </div>
  );
};
