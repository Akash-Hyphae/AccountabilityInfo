import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Target,
  Zap,
  Sprout,
  ArrowRight,
  Plus,
  Play,
  Check
} from 'lucide-react';
import { api } from '../api/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useDate } from '../context/DateContext.tsx';
import { AiInsightCard } from '../components/dashboard/AiInsightCard.tsx';
import { Task, Habit, DailyAnalysis } from '../types.ts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedDate, formattedDisplayDate } = useDate();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, habitsRes, analysisRes] = await Promise.all([
        api.get(`/api/tasks?date=${selectedDate}`),
        api.get('/api/habits'),
        api.get(`/api/analysis/${selectedDate}`)
      ]);
      setTasks(tasksRes.data || []);
      setHabits(habitsRes.data || []);
      setAnalysis(analysisRes.data || null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const toggleTask = async (id: string, current: boolean) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !current } : t)));
    try {
      await api.put(`/api/tasks/${id}`, { completed: !current });
    } catch (err) {
      console.error('Error toggling task:', err);
      fetchDashboardData();
    }
  };

  const toggleHabit = async (id: string) => {
    try {
      const res = await api.put(`/api/habits/${id}/toggle`, { date: selectedDate });
      setHabits(prev => prev.map(h => (h.id === id ? res.data : h)));
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highestPriorityTasks = tasks.filter(t => t.priority === 'highest');

  // Greeting based on local hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Daily Accountability Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mt-0.5">
            {greeting}, {user?.name?.split(' ')[0] || 'Member'}! 🌿
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "Nurture Today. A Better You Tomorrow." · Data for{' '}
            <strong className="text-gray-800 dark:text-gray-200 font-semibold">{formattedDisplayDate}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/focus')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors min-h-[44px]"
            aria-label="Start Focus Timer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus Timer</span>
          </button>
          <button
            onClick={() => navigate('/accountability')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
            aria-label="Open Planner Sheet"
          >
            <span>Open Planner Sheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Daily Insight */}
      <AiInsightCard date={selectedDate} />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 animate-pulse space-y-3"
            >
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            </div>
          ))
        ) : (
          <>
            {/* Metric 1: Tasks Done */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tasks Completed</span>
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                  {completedTasks}/{totalTasks}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Productivity Rating */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Productivity</span>
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                  {analysis?.productivity ?? 7}
                </span>
                <span className="text-xs font-semibold text-gray-400">/10</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                {analysis?.productivity && analysis.productivity >= 8
                  ? 'Peak execution'
                  : 'Steady execution'}
              </p>
            </div>

            {/* Metric 3: Focus Score */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Focus Score</span>
                <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                  {analysis?.focus ?? 7}
                </span>
                <span className="text-xs font-semibold text-gray-400">/10</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Distractions: <strong className="text-gray-700 dark:text-gray-300">{analysis?.distractions ?? 3}/10</strong>
              </p>
            </div>

            {/* Metric 4: Habit Streak */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Longest Streak</span>
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
                  {habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0), 0) : 0}
                </span>
                <span className="text-xs font-semibold text-gray-400">Days</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {habits.length} habits tracked
              </p>
            </div>
          </>
        )}
      </div>

      {/* Two Column Section: Priority Must-Dos & Quick Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Highest Priority Tasks */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                Highest Priority (Must-Do Today)
              </h2>
            </div>
            <button
              onClick={() => navigate('/accountability')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {highestPriorityTasks.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl text-gray-400 text-xs">
                No highest-priority tasks set for today.
                <button
                  onClick={() => navigate('/accountability')}
                  className="block mx-auto mt-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  + Add Must-Do tasks in Planner
                </button>
              </div>
            ) : (
              highestPriorityTasks.map((task, idx) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-800 text-gray-400 dark:text-gray-500'
                      : 'bg-[#fff1f2]/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-gray-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-rose-500 w-5 select-none">{idx + 1}.</span>
                    <span className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-rose-300 dark:text-rose-700 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 cols: Daily Habit Water-The-Plant Checklist */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Sprout className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  Water Your Mind (Habits)
                </h2>
              </div>
              <button
                onClick={() => navigate('/habits')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {habits.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl">
                  No habits added yet. Click Manage to create your daily habits.
                </div>
              ) : (
                habits.slice(0, 5).map((habit) => {
                  const isCompletedToday = habit.completedDates?.includes(selectedDate);
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isCompletedToday
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                          : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/60 text-emerald-600">
                          <Sprout className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{habit.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">
                          🔥 {habit.currentStreak || 0}d
                        </span>
                        {isCompletedToday ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
            <p className="font-handwriting text-lg text-emerald-900 dark:text-emerald-300 text-center leading-snug">
              "Discipline is simply choosing what you want most over what you want now."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
