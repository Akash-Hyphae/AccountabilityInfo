import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Flame,
  Star,
  Leaf,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { api } from '../../api/api.ts';
import { Task, TaskPriority } from '../../types.ts';

interface PriorityTasksProps {
  date: string;
  onTasksChanged?: () => void;
}

export const PriorityTasks: React.FC<PriorityTasksProps> = ({ date, onTasksChanged }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingCategory, setAddingCategory] = useState<TaskPriority | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/tasks?date=${date}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [date]);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !currentStatus } : t)));
    try {
      await api.put(`/api/tasks/${id}`, { completed: !currentStatus });
      onTasksChanged?.();
    } catch (err) {
      console.error('Error toggling task:', err);
      fetchTasks();
    }
  };

  const updateTitle = async (id: string, title: string) => {
    if (!title.trim()) return;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, title: title.trim() } : t)));
    try {
      await api.put(`/api/tasks/${id}`, { title: title.trim() });
      onTasksChanged?.();
    } catch (err) {
      console.error('Error updating task title:', err);
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await api.delete(`/api/tasks/${id}`);
      onTasksChanged?.();
    } catch (err) {
      console.error('Error deleting task:', err);
      fetchTasks();
    }
  };

  const handleAddTask = async (priority: TaskPriority) => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/api/tasks', {
        title: newTitle.trim(),
        priority,
        date
      });
      setTasks(prev => [...prev, res.data]);
      setNewTitle('');
      setAddingCategory(null);
      onTasksChanged?.();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const categories: {
    priority: TaskPriority;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    headerBg: string;
    headerText: string;
    border: string;
    accentColor: string;
    badgeBg: string;
  }[] = [
    {
      priority: 'highest',
      label: 'Highest Priority',
      sublabel: '(Must Do Today)',
      icon: Flame,
      headerBg: 'bg-[#fff1f2] dark:bg-rose-950/40',
      headerText: 'text-[#9f1239] dark:text-rose-200',
      border: 'border-[#fecdd3] dark:border-rose-900/60',
      accentColor: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
    },
    {
      priority: 'medium',
      label: 'Medium Priority',
      sublabel: '(Important)',
      icon: Star,
      headerBg: 'bg-[#fefce8] dark:bg-amber-950/40',
      headerText: 'text-[#854d0e] dark:text-amber-200',
      border: 'border-[#fef08a] dark:border-amber-900/60',
      accentColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    {
      priority: 'least',
      label: 'Least Priority',
      sublabel: '(If Time Permits)',
      icon: Leaf,
      headerBg: 'bg-[#f0fdf4] dark:bg-emerald-950/40',
      headerText: 'text-[#166534] dark:text-emerald-200',
      border: 'border-[#bbf7d0] dark:border-emerald-900/60',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      priority: 'other',
      label: 'Other Tasks / Personal',
      sublabel: '(Personal / Habits / Misc)',
      icon: Layers,
      headerBg: 'bg-[#f0f9ff] dark:bg-sky-950/40',
      headerText: 'text-[#075985] dark:text-sky-200',
      border: 'border-[#bae6fd] dark:border-sky-900/60',
      accentColor: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* Top Banner matching reference image */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200/70 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
              Today's Priority Matrix
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Break it down · Prioritize ruthlessly · Execute
            </p>
          </div>
        </div>

        {/* Task Counter badge */}
        <div className="text-[11px] font-semibold px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 shadow-2xs">
          {completedCount} / {tasks.length} Completed
        </div>
      </div>

      {/* 4 Priority Sections */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
        {loading ? (
          /* Loading Skeletons for 4 categories */
          <div className="p-5 space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-7 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-5/6 ml-4" />
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const catTasks = tasks.filter(t => t.priority === cat.priority);
            const catCompleted = catTasks.filter(t => t.completed).length;
            const Icon = cat.icon;
            const isAddingThis = addingCategory === cat.priority;

            return (
              <div key={cat.priority} className="p-4 sm:p-5">
                {/* Category Header */}
                <div
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl border ${cat.headerBg} ${cat.border} mb-2.5 transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${cat.accentColor} flex-shrink-0`} />
                    <span className={`text-xs sm:text-sm font-bold ${cat.headerText}`}>
                      {cat.label}
                    </span>
                    <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                      {cat.sublabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {catTasks.length > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeBg}`}>
                        {catCompleted}/{catTasks.length}
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setAddingCategory(isAddingThis ? null : cat.priority);
                        setNewTitle('');
                      }}
                      className="text-xs flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                      aria-label={`Add ${cat.label} task`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Task Input */}
                {isAddingThis && (
                  <div className="mb-2.5 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/70 p-2 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(cat.priority);
                        if (e.key === 'Escape') setAddingCategory(null);
                      }}
                      placeholder={`Enter ${cat.label.toLowerCase()}...`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddTask(cat.priority)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setAddingCategory(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                      aria-label="Cancel adding task"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Task Items List */}
                <div className="space-y-1">
                  {catTasks.length === 0 && !isAddingThis ? (
                    <div className="py-2 px-3 text-xs text-gray-400 dark:text-gray-500 italic flex items-center justify-between bg-gray-50/40 dark:bg-gray-800/20 rounded-xl">
                      <span>No tasks in this category yet.</span>
                      <button
                        onClick={() => setAddingCategory(cat.priority)}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        + Add item
                      </button>
                    </div>
                  ) : (
                    catTasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all border ${
                          task.completed
                            ? 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800/50'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        {/* Left: Numbering & Task Title Input */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-5 flex-shrink-0 select-none">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            key={task.id + '-' + task.title}
                            defaultValue={task.title}
                            onBlur={(e) => {
                              if (e.target.value !== task.title) {
                                updateTitle(task.id, e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className={`w-full bg-transparent text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-800 rounded px-1.5 py-0.5 transition-colors ${
                              task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                            }`}
                          />
                        </div>

                        {/* Right: Checkbox & Delete */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleTask(task.id, task.completed)}
                            className="text-gray-400 hover:text-emerald-600 transition-transform active:scale-90 p-0.5 rounded focus:outline-none"
                            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                            aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-emerald-500 transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
