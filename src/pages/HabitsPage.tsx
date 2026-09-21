import React, { useState, useEffect } from 'react';
import { Sprout, Plus, Trash2, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';
import { api } from '../api/api.ts';
import { Habit } from '../types.ts';

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Discipline');

  // Generate last 7 days for the weekly streak matrix
  const getPast7Days = () => {
    const days = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const past7Days = getPast7Days();

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/habits');
      setHabits(res.data || []);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/api/habits', {
        title: newTitle.trim(),
        category: newCategory
      });
      setHabits(prev => [...prev, res.data]);
      setNewTitle('');
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const toggleHabitDate = async (id: string, dateStr: string) => {
    try {
      const res = await api.put(`/api/habits/${id}/toggle`, { date: dateStr });
      setHabits(prev => prev.map(h => (h.id === id ? res.data : h)));
    } catch (err) {
      console.error('Failed to toggle habit date:', err);
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    try {
      await api.delete(`/api/habits/${id}`);
    } catch (err) {
      console.error('Failed to delete habit:', err);
      fetchHabits();
    }
  };

  const addQuickHabit = async (title: string, category: string) => {
    try {
      const res = await api.post('/api/habits', { title, category });
      setHabits(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to quick-add habit:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Habit Tracker & Mental Garden
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "Every completed habit is a drop of water on the plant of your mind."
          </p>
        </div>

        {/* Quick motivational metric */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Consistency: {habits.filter(h => (h.currentStreak || 0) > 0).length} of {habits.length} Active</span>
        </div>
      </div>

      {/* Add Habit Bar */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
        <form onSubmit={handleCreateHabit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Read 20 pages of nonfiction, Morning meditation..."
            className="flex-1 w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Discipline">Discipline</option>
            <option value="Health">Health & Body</option>
            <option value="Focus">Deep Focus</option>
            <option value="Mindset">Mindset</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Plant Habit</span>
          </button>
        </form>
      </div>

      {/* Weekly Matrix Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ) : habits.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              No Habits Seeded Yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5 max-w-sm mx-auto">
              Start building your streak. Pick a recommendation or create your own above:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {[
                { title: 'Morning 20-min Cold Walk', cat: 'Health' },
                { title: '90m Deep Focus Block', cat: 'Focus' },
                { title: 'Daily Accountability Review', cat: 'Discipline' },
                { title: 'No Phone Before 9 AM', cat: 'Mindset' }
              ].map((rec) => (
                <button
                  key={rec.title}
                  onClick={() => addQuickHabit(rec.title, rec.cat)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 hover:bg-emerald-100 transition-colors"
                >
                  + {rec.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <th className="py-3 px-4 w-1/3">Habit & Routine</th>
                  <th className="py-3 px-3 text-center">Streak</th>
                  {past7Days.map((d) => (
                    <th key={d.dateStr} className="py-3 px-2 text-center w-12 sm:w-16">
                      <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {d.dayName}
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-200 font-bold">{d.dayNum}</div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center w-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                {habits.map((habit) => (
                  <tr key={habit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{habit.title}</span>
                          <span className="block text-[10px] text-gray-400 font-normal">{habit.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* Streak badge */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                        <Flame className="w-3 h-3 fill-current" />
                        {habit.currentStreak || 0}d
                      </span>
                    </td>

                    {/* 7 Days Checkboxes */}
                    {past7Days.map((d) => {
                      const isCompleted = habit.completedDates?.includes(d.dateStr);
                      return (
                        <td key={d.dateStr} className="py-3 px-2 text-center">
                          <button
                            onClick={() => toggleHabitDate(habit.id, d.dateStr)}
                            className="p-1 hover:scale-110 active:scale-95 transition-transform"
                            title={`${habit.title} on ${d.dateStr}`}
                            aria-label={`Toggle ${habit.title} on ${d.dateStr}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto hover:text-emerald-500" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Delete habit"
                        aria-label={`Delete habit ${habit.title}`}
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
