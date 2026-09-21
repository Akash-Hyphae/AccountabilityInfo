import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart2, TrendingUp, Calendar, Zap, ShieldAlert, Target } from 'lucide-react';
import { api } from '../api/api.ts';

export const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/analytics?days=${days}`);
      setData(res.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Productivity & Accountability Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualizing your actual consistency, focus levels, and execution trajectory
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { label: '7 Days', val: 7 },
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDays(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                days === item.val
                  ? 'bg-white dark:bg-[#1e293b] text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Avg Completion Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {data?.taskStats?.completionRate ?? 0}%
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {data?.taskStats?.completedTasks ?? 0} of {data?.taskStats?.totalTasks ?? 0} tasks done
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Avg Productivity</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
            {data?.averages?.productivity ?? 7}/10
          </div>
          <p className="text-xs text-gray-400 mt-1">Across {days} tracked days</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Avg Focus Zone</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-500 mt-1">
            {data?.averages?.focus ?? 7}/10
          </div>
          <p className="text-xs text-gray-400 mt-1">Deep work clarity score</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <span className="text-xs text-gray-400 font-medium">Avg Distraction Level</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-500 mt-1">
            {data?.averages?.distractions ?? 3}/10
          </div>
          <p className="text-xs text-gray-400 mt-1">Friction & interruption rating</p>
        </div>
      </div>

      {/* Chart 1: Daily Productivity & Focus Trends */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              Productivity & Focus Trends (1–10 Scale)
            </h3>
            <p className="text-xs text-gray-500">Tracking daily rhythm and mental stamina</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.dailyTrends || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="productivity"
                name="Productivity"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="focus"
                name="Focus"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="distractions"
                name="Distraction"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Task Completion Breakdown */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              Tasks Planned vs Completed
            </h3>
            <p className="text-xs text-gray-500">Comparison of planned commitments vs actual executions</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.dailyTrends || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="tasksCompleted" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalTasks" name="Total Planned Tasks" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
