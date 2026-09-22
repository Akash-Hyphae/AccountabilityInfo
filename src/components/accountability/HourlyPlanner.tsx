import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { api } from '../../api/api.ts';
import { PlannerItem } from '../../types.ts';
import { useDate } from '../../context/DateContext.tsx';

interface HourlyPlannerProps {
  date: string;
}

const DEFAULT_HOURS = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
  '11:00 PM'
];

export const HourlyPlanner: React.FC<HourlyPlannerProps> = ({ date }) => {
  const { setSelectedDate, formattedDisplayDate, goToPreviousDay, goToNextDay } = useDate();
  const [planner, setPlanner] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTime, setNewTime] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isSeedingDefault, setIsSeedingDefault] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const datePickerRef = useRef<HTMLInputElement>(null);

  const fetchPlanner = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/planner/${date}`);
      const items: PlannerItem[] = res.data || [];
      // Guarantee zero duplicates by time
      const seenTimes = new Set<string>();
      const deduped: PlannerItem[] = [];
      for (const item of items) {
        if (!seenTimes.has(item.time)) {
          seenTimes.add(item.time);
          deduped.push(item);
        }
      }
      setPlanner(deduped);
    } catch (err) {
      console.error('Error fetching planner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner();
  }, [date]);

  const updateItem = async (id: string, updates: Partial<PlannerItem>) => {
    setSaveStatus('saving');
    // Optimistic UI update
    setPlanner(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
    try {
      await api.put(`/api/planner/${id}`, updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } catch (err) {
      console.error('Failed to update planner item:', err);
      fetchPlanner();
      setSaveStatus('idle');
    }
  };

  const deleteItem = async (id: string) => {
    setPlanner(prev => prev.filter(item => item.id !== id));
    try {
      await api.delete(`/api/planner/${id}`);
    } catch (err) {
      console.error('Failed to delete planner item:', err);
      fetchPlanner();
    }
  };

  const addRow = async (timeVal?: string) => {
    const timeToUse = timeVal || newTime.trim();
    if (!timeToUse) return;
    try {
      const res = await api.post('/api/planner', {
        date,
        time: timeToUse,
        plannedTask: '',
        actualTask: '',
        isCompleted: false
      });
      setPlanner(prev => [...prev, res.data]);
      setNewTime('');
      setIsAddingCustom(false);
    } catch (err) {
      console.error('Failed to add planner row:', err);
    }
  };

  const seedStandardDay = async () => {
    setIsSeedingDefault(true);
    try {
      const promises = DEFAULT_HOURS.map(t =>
        api.post('/api/planner', {
          date,
          time: t,
          plannedTask: '',
          actualTask: '',
          isCompleted: false
        })
      );
      const results = await Promise.all(promises);
      setPlanner(results.map(r => r.data));
    } catch (err) {
      console.error('Error seeding default hours:', err);
    } finally {
      setIsSeedingDefault(false);
    }
  };

  const completedSlots = planner.filter(p => p.isCompleted).length;

  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* Table Header / Subtitle & Date Selector */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200/70 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/60 dark:bg-gray-800/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Hourly Planner & Timeline
            </span>
            <span className="block text-[11px] text-gray-500 dark:text-gray-400">
              Plan proactively · Record real execution honestly
            </span>
          </div>
        </div>

        {/* Date Selector & Completion Counter */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          {saveStatus === 'saved' && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in duration-200">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          )}

          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs shadow-2xs">
            <button
              onClick={goToPreviousDay}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-0.5 rounded transition-colors"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div
              onClick={() => datePickerRef.current?.showPicker?.() || datePickerRef.current?.focus()}
              className="cursor-pointer flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Select date"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{formattedDisplayDate}</span>
              <input
                ref={datePickerRef}
                type="date"
                value={date}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="sr-only"
              />
            </div>
            <button
              onClick={goToNextDay}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-0.5 rounded transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 rounded-lg">
            {completedSlots} / {planner.length} Done
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200/80 dark:border-gray-800 bg-[#edf3f8] dark:bg-gray-800/80 font-bold text-gray-700 dark:text-gray-200 select-none">
              <th className="py-2.5 px-3 sm:px-4 w-24 sm:w-28 border-r border-gray-200/70 dark:border-gray-800 text-[11px] uppercase tracking-wider font-bold">
                Time
              </th>
              <th className="py-2.5 px-3 sm:px-4 w-[36%] min-w-[170px] border-r border-gray-200/70 dark:border-gray-800 bg-[#eef5fa] dark:bg-gray-800/60 text-[11px] uppercase tracking-wider">
                <span className="text-gray-900 dark:text-gray-100 font-bold">Planned Task</span>
                <span className="block normal-case font-normal text-[10px] text-gray-500 dark:text-gray-400">
                  (What you will do)
                </span>
              </th>
              <th className="py-2.5 px-3 sm:px-4 w-[54%] min-w-[260px] bg-[#eaf7f0] dark:bg-emerald-950/20 text-[11px] uppercase tracking-wider">
                <span className="text-emerald-900 dark:text-emerald-200 font-bold">Done & Actual Log</span>
                <span className="block normal-case font-normal text-[10px] text-emerald-700 dark:text-emerald-400">
                  (What you actually did)
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading ? (
              /* Polished skeleton rows */
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-4 border-r border-gray-100 dark:border-gray-800">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-md w-16" />
                  </td>
                  <td className="py-3 px-4 border-r border-gray-100 dark:border-gray-800">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-md w-3/4" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700/60 rounded-full flex-shrink-0" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-md w-1/2" />
                    </div>
                  </td>
                </tr>
              ))
            ) : planner.length === 0 ? (
              /* High-craft Empty State */
              <tr>
                <td colSpan={3} className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-2xs">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      No hourly slots for {formattedDisplayDate}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5">
                      Schedule your day hour-by-hour to stay intentional and accountable.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={seedStandardDay}
                        disabled={isSeedingDefault}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isSeedingDefault ? 'Initializing...' : 'Populate 16 Hours (8 AM – 12 AM)'}</span>
                      </button>
                      <button
                        onClick={() => setIsAddingCustom(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Slot</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              planner.map((row) => (
                <tr
                  key={row.id}
                  className={`group transition-colors ${
                    row.isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                  }`}
                >
                  {/* Time column with editable time input and delete button */}
                  <td className="py-2 px-3 sm:px-4 border-r border-gray-200/70 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap bg-gray-50/30 dark:bg-gray-800/20">
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        key={row.id + '-time-' + row.time}
                        defaultValue={row.time}
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          if (val && val !== row.time) {
                            updateItem(row.id, { time: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        placeholder="Time"
                        className="w-20 sm:w-24 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 rounded px-1 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none transition-colors"
                        title="Click to edit time slot"
                      />
                      <button
                        onClick={() => deleteItem(row.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Delete slot"
                        aria-label="Delete time slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Planned task input */}
                  <td className="py-2 px-3 sm:px-4 border-r border-gray-200/70 dark:border-gray-800">
                    <input
                      type="text"
                      key={row.id + '-plan-' + row.plannedTask}
                      defaultValue={row.plannedTask}
                      onBlur={(e) => {
                        if (e.target.value !== row.plannedTask) {
                          updateItem(row.id, { plannedTask: e.target.value });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      placeholder="e.g. Deep Work: System Architecture review"
                      className="w-full px-2 py-1 text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800/80 rounded transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </td>

                  {/* What Actually Happened / Done toggle */}
                  <td className="py-2 px-3 sm:px-4 bg-[#f6fcf8]/60 dark:bg-emerald-950/5">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => updateItem(row.id, { isCompleted: !row.isCompleted })}
                        className="flex-shrink-0 transition-transform active:scale-90 p-0.5 rounded-full focus:outline-none"
                        title={row.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                        aria-label={row.isCompleted ? 'Mark slot incomplete' : 'Mark slot complete'}
                      >
                        {row.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-emerald-500 transition-colors" />
                        )}
                      </button>

                      <input
                        type="text"
                        key={row.id + '-actual-' + row.actualTask}
                        defaultValue={row.actualTask}
                        onBlur={(e) => {
                          if (e.target.value !== row.actualTask) {
                            updateItem(row.id, { actualTask: e.target.value });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        placeholder="What actually occurred (be honest)..."
                        className={`w-full px-2 py-1 text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-emerald-200 dark:hover:border-emerald-900/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800/80 rounded transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                          row.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''
                        }`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Custom Time Slot Button */}
      <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
        {isAddingCustom ? (
          <div className="flex items-center gap-2 w-full max-w-sm">
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addRow();
              }}
              placeholder="e.g. 10:00 PM or Late Night"
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => addRow()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingCustom(false)}
              className="px-2.5 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingCustom(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Time Slot</span>
            </button>
            {planner.length < 5 && planner.length > 0 && (
              <button
                onClick={seedStandardDay}
                disabled={isSeedingDefault}
                className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-emerald-600 underline"
              >
                + Fill rest of day
              </button>
            )}
          </div>
        )}

        <div className="text-[11px] text-gray-400 dark:text-gray-500">
          Persistent to MongoDB Atlas
        </div>
      </div>
    </div>
  );
};
