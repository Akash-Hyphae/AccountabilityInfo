import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle, ThumbsUp, ThumbsDown, BatteryCharging, Zap, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../api/api.ts';
import { DailyAnalysis } from '../../types.ts';

interface TodayAnalysisProps {
  date: string;
}

export const TodayAnalysis: React.FC<TodayAnalysisProps> = ({ date }) => {
  const [analysis, setAnalysis] = useState<DailyAnalysis>({
    date,
    tasksCompleted: 0,
    totalTasks: 0,
    productivity: 7,
    focus: 7,
    distractions: 3,
    energy: 7,
    isGoodDay: true,
    notes: ''
  });

  const [localNotes, setLocalNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalysis = async () => {
    try {
      const [analysisRes, tasksRes] = await Promise.all([
        api.get(`/api/analysis/${date}`),
        api.get(`/api/tasks?date=${date}`)
      ]);

      const tasks = tasksRes.data || [];
      const completedCount = tasks.filter((t: any) => t.completed).length;

      if (analysisRes.data && analysisRes.data.productivity !== undefined) {
        setAnalysis({
          ...analysisRes.data,
          tasksCompleted: analysisRes.data.tasksCompleted ?? completedCount,
          totalTasks: analysisRes.data.totalTasks ?? tasks.length
        });
        setLocalNotes(analysisRes.data.notes || '');
      } else {
        const initial = {
          date,
          tasksCompleted: completedCount,
          totalTasks: tasks.length,
          productivity: 7,
          focus: 7,
          distractions: 3,
          energy: 7,
          isGoodDay: true,
          notes: ''
        };
        setAnalysis(initial);
        setLocalNotes('');
      }
    } catch (err) {
      console.error('Error fetching today analysis:', err);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [date]);

  const updateField = async (updates: Partial<DailyAnalysis>) => {
    const next = { ...analysis, ...updates };
    setAnalysis(next);
    setIsSaving(true);
    try {
      await api.post('/api/analysis', next);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save analysis:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesChange = (text: string) => {
    setLocalNotes(text);
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    notesTimeoutRef.current = setTimeout(() => {
      updateField({ notes: text });
    }, 600);
  };

  const handleNotesBlur = () => {
    if (localNotes !== analysis.notes) {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
      updateField({ notes: localNotes });
    }
  };

  const RatingRow = ({
    label,
    value,
    onChange,
    lowLabel,
    highLabel,
    icon: Icon,
    colorClass
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    lowLabel: string;
    highLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
  }) => {
    return (
      <div className="py-2.5 border-b border-gray-100 dark:border-gray-800/80 last:border-b-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${colorClass}`} />
            <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
              {label} (1–10)
            </span>
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
            {value}/10
          </span>
        </div>

        {/* 1 to 10 clickable numbered pill buttons */}
        <div className="flex items-center justify-between gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                aria-label={`Set ${label} to ${num}`}
                className={`flex-1 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs scale-105'
                    : 'bg-gray-100/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-0.5">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs p-5 transition-colors">
      {/* Header matching image */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200/70 dark:border-gray-800 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
              Daily Analysis & Mindset
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Honest self-assessment and vitality audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> Saving...
            </span>
          )}
          {isSaved && !isSaving && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-150">
              <CheckCircle className="w-3.5 h-3.5" /> Saved to MongoDB
            </span>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-1">
        {/* Tasks completed summary display */}
        <div className="py-2.5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
            Tasks completed today:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={analysis.tasksCompleted}
              onChange={(e) => updateField({ tasksCompleted: parseInt(e.target.value, 10) || 0 })}
              className="w-12 text-center text-xs sm:text-sm font-bold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-gray-400 font-bold">/</span>
            <input
              type="number"
              min="0"
              value={analysis.totalTasks}
              onChange={(e) => updateField({ totalTasks: parseInt(e.target.value, 10) || 0 })}
              className="w-12 text-center text-xs sm:text-sm font-bold bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Productivity 1-10 */}
        <RatingRow
          label="Productivity"
          value={analysis.productivity}
          onChange={(val) => updateField({ productivity: val })}
          lowLabel="Low execution"
          highLabel="Peak execution"
          icon={Zap}
          colorClass="text-amber-500"
        />

        {/* Focus Level 1-10 */}
        <RatingRow
          label="Focus Level"
          value={analysis.focus}
          onChange={(val) => updateField({ focus: val })}
          lowLabel="Scattered mind"
          highLabel="Deep zone"
          icon={Target}
          colorClass="text-emerald-500"
        />

        {/* Distractions 1-10 */}
        <RatingRow
          label="Distractions"
          value={analysis.distractions}
          onChange={(val) => updateField({ distractions: val })}
          lowLabel="Zero friction"
          highLabel="Heavy derailment"
          icon={ShieldAlert}
          colorClass="text-rose-500"
        />

        {/* Energy Level 1-10 */}
        <RatingRow
          label="Energy Level"
          value={analysis.energy}
          onChange={(val) => updateField({ energy: val })}
          lowLabel="Exhausted"
          highLabel="Vibrant & energized"
          icon={BatteryCharging}
          colorClass="text-blue-500"
        />

        {/* Overall, was it a good day? */}
        <div className="py-3 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
            Overall, was it a good day?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateField({ isGoodDay: true })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                analysis.isGoodDay
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Yes</span>
            </button>
            <button
              type="button"
              onClick={() => updateField({ isGoodDay: false })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !analysis.isGoodDay
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>No</span>
            </button>
          </div>
        </div>

        {/* Any other notes */}
        <div className="pt-3">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Key Mental & Vitality Observations:
          </label>
          <textarea
            rows={3}
            value={localNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Document mental blockers, sleep quality, peak performance hours..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors placeholder-gray-400 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
