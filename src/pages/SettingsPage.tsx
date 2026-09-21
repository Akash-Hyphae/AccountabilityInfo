import React, { useState } from 'react';
import { Settings, User, Moon, Sun, Download, Database, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { api } from '../api/api.ts';

export const SettingsPage: React.FC = () => {
  const { user, updateUserName } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateUserName(name.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error updating name:', err);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const res = await api.get('/api/analytics?days=365');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `accountabilityInfo-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <Settings className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Account & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your credentials, theme, and data preferences
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Primary email used for JWT session authentication
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Save Changes
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Theme Preferences */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
            Interface Theme
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                  theme === item.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Export & Database Engine */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <Database className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-base text-gray-900 dark:text-gray-100">
            Data Architecture & Portability
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  MongoDB Atlas + Persistent Storage Engine
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your data is automatically synced securely to MongoDB Atlas when MONGODB_URI is provided, with persistent fallback guarantees.
              </p>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
