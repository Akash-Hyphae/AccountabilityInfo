import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  BarChart2,
  FileText,
  Sprout,
  Timer,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onNavigate }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accountability', label: 'Accountability', icon: CheckSquare, badge: 'Core' },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/habits', label: 'Habit Tracker', icon: Sprout },
    { to: '/focus', label: 'Focus Mode', icon: Timer },
    { to: '/ai-analysis', label: 'AI Review', icon: Sparkles, badge: 'Gemini' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`flex flex-col justify-between h-full bg-white dark:bg-[#1e293b] border-r border-gray-200/80 dark:border-gray-800 p-3.5 transition-colors select-none ${className}`}
      aria-label="Main Navigation"
    >
      {/* Navigation List */}
      <nav className="space-y-1 mt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    {/* Active accent vertical line */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide ${
                        item.badge === 'Gemini'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Motivational Quote at bottom of sidebar (matching the reference image) */}
      <div className="pt-4 pb-2 px-3 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] tracking-wider uppercase font-bold">
              Mindset Anchor
            </span>
          </div>
          <p className="font-handwriting text-lg text-emerald-950 dark:text-emerald-200 leading-snug">
            "Small steps daily, big results eventually."
          </p>
        </div>
      </div>
    </aside>
  );
};
