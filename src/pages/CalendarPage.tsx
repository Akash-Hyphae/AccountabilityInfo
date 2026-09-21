import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { useDate } from '../context/DateContext.tsx';

export const CalendarPage: React.FC = () => {
  const { setSelectedDate } = useDate();
  const navigate = useNavigate();

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleSelectDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
    navigate('/accountability');
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Accountability History Calendar
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review previous days, track your discipline consistency, and jump to any date's hourly sheet.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 px-2 min-w-[120px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm p-6">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 pt-4">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-2xl bg-gray-50/40 dark:bg-gray-800/20" />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = isCurrentMonth && today.getDate() === dayNum;

            return (
              <div
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={`h-20 sm:h-24 p-2 sm:p-2.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs'
                    : 'border-gray-100 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-[#1e293b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 group">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold opacity-80">
                    Open Sheet
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
