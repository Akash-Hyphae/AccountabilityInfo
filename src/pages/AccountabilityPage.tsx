import React, { useState, useRef } from 'react';
import { useDate } from '../context/DateContext.tsx';
import { PriorityTasks } from '../components/accountability/PriorityTasks.tsx';
import { HourlyPlanner } from '../components/accountability/HourlyPlanner.tsx';
import { ReflectionSection } from '../components/accountability/ReflectionSection.tsx';
import { TodayAnalysis } from '../components/accountability/TodayAnalysis.tsx';
import { AiInsightCard } from '../components/dashboard/AiInsightCard.tsx';
import { Calendar, Sprout, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const AccountabilityPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    formattedDisplayDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    isToday
  } = useDate();
  const [, setRefreshSignal] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleTasksChanged = () => {
    setRefreshSignal(prev => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Sprout className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Daily Accountability Sheet
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "Plan → Do → Track → Reflect → Improve → Grow."
          </p>
        </div>

        {/* Date Selector Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
            className="cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700/80 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700 transition-colors"
            title="Click to select specific date"
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{formattedDisplayDate}</span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="sr-only"
            />
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={goToToday}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 px-2.5 py-1.5 rounded-xl transition-colors"
              title="Return to Today"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>
          )}

          {isToday && (
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-1 rounded-lg">
              Today
            </span>
          )}
        </div>
      </div>

      {/* AI Daily Insight Banner */}
      <AiInsightCard date={selectedDate} />

      {/* Section 1: Hourly Planner (Left) & Priority Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Hourly Planner (7 cols on lg screens) */}
        <div className="lg:col-span-7">
          <HourlyPlanner date={selectedDate} />
        </div>

        {/* Right Column: 4 Priority Cards (Highest, Medium, Least, Other task) (5 cols on lg screens) */}
        <div className="lg:col-span-5">
          <PriorityTasks date={selectedDate} onTasksChanged={handleTasksChanged} />
        </div>
      </div>

      {/* Section 2: Daily Analysis & Mindset (Left) & Reflection Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Daily Analysis & Mindset (7 cols on lg screens) */}
        <div className="lg:col-span-7">
          <TodayAnalysis date={selectedDate} />
        </div>

        {/* Right Column: Mistakes, Improvements, Daily Notes & Journal (5 cols on lg screens) */}
        <div className="lg:col-span-5">
          <ReflectionSection date={selectedDate} />
        </div>
      </div>
    </div>
  );
};
