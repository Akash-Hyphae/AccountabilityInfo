import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BarChart2,
  Calendar,
  FileText,
  Sprout,
  Timer,
  Settings,
  Sparkles,
  X,
  LogOut,
  Grid
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileNavbarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accountability', label: 'Accountability Sheet', icon: CheckSquare, badge: 'Core' },
    { to: '/calendar', label: 'Calendar Planner', icon: Calendar },
    { to: '/goals', label: 'Goals & Milestones', icon: Target },
    { to: '/analytics', label: 'Analytics & Trends', icon: BarChart2 },
    { to: '/notes', label: 'Daily Notes & Journal', icon: FileText },
    { to: '/habits', label: 'Habit Tracker', icon: Sprout },
    { to: '/focus', label: 'Focus Mode (Pomodoro)', icon: Timer },
    { to: '/ai-analysis', label: 'Gemini AI Review', icon: Sparkles, badge: 'AI' },
    { to: '/settings', label: 'Preferences & Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-[#1e293b] shadow-2xl p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div className="overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <BrandLogo size="sm" />
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Quote and Logout */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <div className="mb-3 px-2">
            <p className="font-handwriting text-lg text-emerald-800 dark:text-emerald-300 leading-tight">
              "Invest in your mind. It always pays back."
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out ({user?.name?.split(' ')[0] || 'User'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const BottomNavigation: React.FC = () => {
  const [showMoreModal, setShowMoreModal] = useState(false);

  const moreItems = [
    { to: '/calendar', label: 'Calendar Planner', icon: Calendar },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/habits', label: 'Habits', icon: Sprout },
    { to: '/ai-analysis', label: 'AI Review', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 md:hidden"
        aria-label="Bottom Navigation"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </NavLink>

          {/* Accountability Sheet */}
          <NavLink
            to="/accountability"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px]">Planner</span>
          </NavLink>

          {/* Habit Tracker */}
          <NavLink
            to="/habits"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <Sprout className="w-5 h-5" />
            <span className="text-[10px]">Habits</span>
          </NavLink>

          {/* Focus Mode */}
          <NavLink
            to="/focus"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <Timer className="w-5 h-5" />
            <span className="text-[10px]">Focus</span>
          </NavLink>

          {/* More Actions Menu */}
          <button
            onClick={() => setShowMoreModal(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors min-h-[44px]"
            aria-label="More options"
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* More Options Modal Sheet */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowMoreModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] rounded-t-3xl shadow-2xl p-6 z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Productivity Tools
              </span>
              <button
                onClick={() => setShowMoreModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMoreModal(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-800 dark:text-gray-200 transition-colors min-h-[44px]"
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-700 text-emerald-600 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
