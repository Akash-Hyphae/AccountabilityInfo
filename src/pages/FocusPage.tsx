import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Sprout } from 'lucide-react';
import { api } from '../api/api.ts';
import { useDate } from '../context/DateContext.tsx';
import { Task } from '../types.ts';

export const FocusPage: React.FC = () => {
  const { selectedDate } = useDate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');

  // Times in seconds
  const modeTimes = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState<number>(modeTimes.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Fetch today's tasks for focus attachment
    api.get(`/api/tasks?date=${selectedDate}`).then((res) => {
      setTasks(res.data || []);
      if (res.data?.length > 0) {
        setSelectedTask(res.data[0].title);
      }
    });
  }, [selectedDate]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const handleCompleteSession = async () => {
    setSessionsCompleted((prev) => prev + 1);
    try {
      await api.post('/api/focus', {
        taskTitle: selectedTask || 'Deep Work Session',
        durationMinutes: modeTimes[mode] / 60,
        type: mode,
      });
    } catch (err) {
      console.error('Error logging focus session:', err);
    }
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(modeTimes[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = ((modeTimes[mode] - timeLeft) / modeTimes[mode]);
  const circleRadius = 110;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Timer className="w-3.5 h-3.5" />
          <span>Deep Focus Sanctuary</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Water Your Mind with Pure Focus
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Eliminate distraction. Protect your attention. Complete the work in front of you.
        </p>
      </div>

      {/* Timer Container Card */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6 sm:p-10 text-center max-w-lg mx-auto transition-colors">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-8 border border-gray-200/60 dark:border-gray-700">
          {[
            { id: 'work', label: 'Pomodoro (25m)' },
            { id: 'shortBreak', label: 'Short Break (5m)' },
            { id: 'longBreak', label: 'Long Break (15m)' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => switchMode(item.id as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === item.id
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* SVG Circular Ring Timer */}
        <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 256 256">
            {/* Background circle track */}
            <circle
              cx="128"
              cy="128"
              r={circleRadius}
              className="text-gray-100 dark:text-gray-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="128"
              cy="128"
              r={circleRadius}
              className="text-emerald-500 transition-all duration-700"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Central text content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sprout className={`w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1 ${isRunning ? 'animate-pulse' : ''}`} />
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 font-mono">
              {formattedTime}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
              {mode === 'work' ? 'Deep Work' : 'Rest & Reset'}
            </span>
          </div>
        </div>

        {/* Task Attachment Dropdown */}
        <div className="mb-8 text-left">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 text-center">
            Currently Focused On:
          </label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-- General Deep Focus Session --</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.title}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-2xs transition-all active:scale-95 min-h-[44px]"
            aria-label={isRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Reset timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Completed count */}
        <div className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          🍅 {sessionsCompleted} Focus sessions completed today
        </div>
      </div>
    </div>
  );
};
