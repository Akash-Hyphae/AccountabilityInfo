import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Circle, Calendar, Tag } from 'lucide-react';
import { api } from '../api/api.ts';
import { Goal } from '../types.ts';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetDate, setTargetDate] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetDate) return;

    try {
      const res = await api.post('/api/goals', {
        title,
        description,
        category,
        targetDate,
        progress: 0,
        status: 'In Progress'
      });
      setGoals(prev => [...prev, res.data]);
      setShowAddModal(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  const updateProgress = async (id: string, newProgress: number) => {
    const status = newProgress >= 100 ? 'Completed' : 'In Progress';
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newProgress, status } : g));
    try {
      await api.put(`/api/goals/${id}`, { progress: newProgress, status });
    } catch (err) {
      console.error('Error updating goal:', err);
      fetchGoals();
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await api.delete(`/api/goals/${id}`);
    } catch (err) {
      console.error('Error deleting goal:', err);
      fetchGoals();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Strategic Long-Term Goals
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "A goal without a daily accountability routine is just a wish."
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const isDone = goal.progress >= 100;
          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border bg-white dark:bg-[#1e293b] shadow-xs flex flex-col justify-between transition-all ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20'
                  : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {goal.category}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className={`font-bold text-base text-gray-900 dark:text-gray-100 ${isDone ? 'line-through text-gray-500' : ''}`}>
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {goal.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target: {goal.targetDate}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {goal.progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Quick progress slider / button */}
                <div className="flex items-center gap-1 justify-between pt-1">
                  {[25, 50, 75, 100].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => updateProgress(goal.id, step)}
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        goal.progress >= step
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {step}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-md z-10">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
              Add New Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Data Structures & Algorithms"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Personal">Personal Development</option>
                  <option value="Career">Career & Coding</option>
                  <option value="Health">Physical Health & Fitness</option>
                  <option value="Mindset">Mindset & Focus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Success Criteria
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Solve 150 LeetCode problems consistently..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
