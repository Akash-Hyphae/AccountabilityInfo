import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { useDate } from '../../context/DateContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface TopNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const { selectedDate, setSelectedDate, formattedDisplayDate, goToToday, goToPreviousDay, goToNextDay, isToday } = useDate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none"
            aria-label="Open navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer">
            <BrandLogo size="md" />
          </div>
        </div>

        {/* Center: Handwritten Motivational Sticky Tape Note (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="tape-effect bg-[#fefce8] dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 px-5 py-2 rounded-lg shadow-xs transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="font-handwriting text-xl text-amber-900 dark:text-amber-200 tracking-wide select-none">
              "Discipline waters your mind, and creates a better tomorrow."
            </p>
          </div>
        </div>

        {/* Right: Date Selector, Theme Toggle, Notification, Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date Selector Pill */}
          <div className="relative" ref={datePickerRef}>
            <div className="flex items-center bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-full px-2 py-1 shadow-xs hover:border-emerald-500/50 transition-colors">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-white dark:hover:bg-gray-700"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-2 py-0.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[130px] sm:max-w-none">{formattedDisplayDate}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={goToNextDay}
                className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-white dark:hover:bg-gray-700"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Date Picker Popover */}
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jump to Date
                  </span>
                  {!isToday && (
                    <button
                      onClick={() => {
                        goToToday();
                        setShowDatePicker(false);
                      }}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Return to Today
                    </button>
                  )}
                </div>
                <div className="pt-3">
                  <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1 font-medium">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setShowDatePicker(false);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifications</h4>
                  <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    1 New
                  </span>
                </div>
                <div className="space-y-2.5 pt-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                      🌿 Midday Water Your Mind Reminder
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                      Check your hourly planner! Log what actually happened so you can reflect honestly tonight.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/30 transition-all focus:outline-none"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {userInitial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || 'Accountability Member'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'demo@accountability.info'}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/ai-analysis');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    AI Intelligence Review
                  </button>
                </div>
                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
