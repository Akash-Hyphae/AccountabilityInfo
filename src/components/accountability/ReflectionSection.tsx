import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingUp, Plus, Trash2, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { api } from '../../api/api.ts';
import { Reflection } from '../../types.ts';

interface ReflectionSectionProps {
  date: string;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({ date }) => {
  const [reflection, setReflection] = useState<Reflection>({
    date,
    mistakes: [],
    improvements: [],
    notes: ''
  });
  const [newMistake, setNewMistake] = useState('');
  const [newImprovement, setNewImprovement] = useState('');
  const [localNotes, setLocalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReflection = async () => {
    try {
      const res = await api.get(`/api/reflection/${date}`);
      if (res.data) {
        const loaded: Reflection = {
          ...res.data,
          mistakes: res.data.mistakes || [],
          improvements: res.data.improvements || [],
          notes: res.data.notes || ''
        };
        setReflection(loaded);
        setLocalNotes(loaded.notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch reflection:', err);
    }
  };

  useEffect(() => {
    fetchReflection();
  }, [date]);

  const saveUpdates = async (updated: Reflection) => {
    setReflection(updated);
    setIsSaving(true);
    try {
      await api.post('/api/reflection', {
        date,
        mistakes: updated.mistakes,
        improvements: updated.improvements,
        notes: updated.notes
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving reflection:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addMistake = () => {
    if (!newMistake.trim()) return;
    const updated: Reflection = {
      ...reflection,
      mistakes: [...reflection.mistakes, newMistake.trim()]
    };
    saveUpdates(updated);
    setNewMistake('');
  };

  const removeMistake = (index: number) => {
    const updated: Reflection = {
      ...reflection,
      mistakes: reflection.mistakes.filter((_, i) => i !== index)
    };
    saveUpdates(updated);
  };

  const updateMistake = (index: number, val: string) => {
    const nextList = [...reflection.mistakes];
    nextList[index] = val;
    saveUpdates({ ...reflection, mistakes: nextList });
  };

  const addImprovement = () => {
    if (!newImprovement.trim()) return;
    const updated: Reflection = {
      ...reflection,
      improvements: [...reflection.improvements, newImprovement.trim()]
    };
    saveUpdates(updated);
    setNewImprovement('');
  };

  const removeImprovement = (index: number) => {
    const updated: Reflection = {
      ...reflection,
      improvements: reflection.improvements.filter((_, i) => i !== index)
    };
    saveUpdates(updated);
  };

  const updateImprovement = (index: number, val: string) => {
    const nextList = [...reflection.improvements];
    nextList[index] = val;
    saveUpdates({ ...reflection, improvements: nextList });
  };

  // Debounced save for Today's Notes textarea
  const handleNotesChange = (text: string) => {
    setLocalNotes(text);
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    notesTimeoutRef.current = setTimeout(() => {
      saveUpdates({ ...reflection, notes: text });
    }, 600);
  };

  const handleNotesBlur = () => {
    if (localNotes !== reflection.notes) {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
      saveUpdates({ ...reflection, notes: localNotes });
    }
  };

  return (
    <div className="space-y-5">
      {/* 2-Column Grid for Mistakes & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: What Mistakes Were Made Today? */}
        <div className="bg-white dark:bg-[#1e293b] border border-rose-200/80 dark:border-rose-950/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between">
          <div>
            {/* Header matching image */}
            <div className="flex items-start gap-2.5 pb-3 border-b border-rose-100 dark:border-rose-900/40 mb-3">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  What Mistakes Were Made Today?
                </h3>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  Be honest · Awareness drives growth
                </p>
              </div>
            </div>

            {/* List of mistakes */}
            <div className="space-y-1.5 mb-3 min-h-[80px]">
              {reflection.mistakes.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 dark:text-gray-500 italic bg-rose-50/30 dark:bg-rose-950/10 rounded-xl">
                  No mistakes logged today. Record any procrastination, missed time blocks, or distractions.
                </div>
              ) : (
                reflection.mistakes.map((mistake: string, idx: number) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/70 dark:border-rose-900/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 w-4 flex-shrink-0 select-none">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      defaultValue={mistake}
                      onBlur={(e) => {
                        if (e.target.value !== mistake) {
                          updateMistake(idx, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="flex-1 text-xs sm:text-sm bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={() => removeMistake(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-white dark:hover:bg-gray-800 transition-opacity"
                      title="Remove item"
                      aria-label="Remove mistake"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Mistake input */}
          <div className="flex items-center gap-2 pt-2 border-t border-rose-100/70 dark:border-rose-900/30">
            <input
              type="text"
              value={newMistake}
              onChange={(e) => setNewMistake(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addMistake();
              }}
              placeholder="e.g. Lost 45 mins checking social feeds..."
              className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              onClick={addMistake}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Card 2: What to Improve Tomorrow? */}
        <div className="bg-white dark:bg-[#1e293b] border border-purple-200/80 dark:border-purple-950/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between">
          <div>
            {/* Header matching image */}
            <div className="flex items-start gap-2.5 pb-3 border-b border-purple-100 dark:border-purple-900/40 mb-3">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  What to Improve Tomorrow?
                </h3>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  Learn today · Execute better tomorrow
                </p>
              </div>
            </div>

            {/* List of improvements */}
            <div className="space-y-1.5 mb-3 min-h-[80px]">
              {reflection.improvements.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 dark:text-gray-500 italic bg-purple-50/30 dark:bg-purple-950/10 rounded-xl">
                  No targets set yet. What is one concrete adjustment you will make tomorrow morning?
                </div>
              ) : (
                reflection.improvements.map((improvement: string, idx: number) => (
                  <div
                    key={idx}
                    className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/70 dark:border-purple-900/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-4 flex-shrink-0 select-none">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      defaultValue={improvement}
                      onBlur={(e) => {
                        if (e.target.value !== improvement) {
                          updateImprovement(idx, e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      className="flex-1 text-xs sm:text-sm bg-transparent border-none text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={() => removeImprovement(idx)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-white dark:hover:bg-gray-800 transition-opacity"
                      title="Remove item"
                      aria-label="Remove improvement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Improvement input */}
          <div className="flex items-center gap-2 pt-2 border-t border-purple-100/70 dark:border-purple-900/30">
            <input
              type="text"
              value={newImprovement}
              onChange={(e) => setNewImprovement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addImprovement();
              }}
              placeholder="e.g. Keep phone in another room until 11 AM..."
              className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={addImprovement}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Today's Notes */}
      <div className="bg-white dark:bg-[#1e293b] border border-amber-200/80 dark:border-amber-950/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-900/40 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                Today's Daily Notes & Journal
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                Document thoughts, victories, and breakthroughs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                Saving...
              </span>
            )}
            {savedSuccess && !isSaving && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved to MongoDB
              </span>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          value={localNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Jot down notes about today: What went exceptionally well? What was challenging? Any key realizations to carry into tomorrow?"
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl bg-amber-50/30 dark:bg-gray-800/80 border border-amber-200/70 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500 font-normal leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400 dark:text-gray-500">
          <span>Self-reflection is the highest form of discipline</span>
          <span>Auto-saves to database</span>
        </div>
      </div>
    </div>
  );
};
