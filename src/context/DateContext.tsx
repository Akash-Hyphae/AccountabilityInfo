import React, { createContext, useContext, useState } from 'react';

interface DateContextType {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  formattedDisplayDate: string;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  isToday: boolean;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use current local date
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const isToday = selectedDate === getTodayStr();

  const formattedDisplayDate = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  })();

  const goToToday = () => {
    setSelectedDate(getTodayStr());
  };

  const goToPreviousDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    setSelectedDate(dateObj.toISOString().split('T')[0]);
  };

  return (
    <DateContext.Provider value={{
      selectedDate,
      setSelectedDate,
      formattedDisplayDate,
      goToToday,
      goToPreviousDay,
      goToNextDay,
      isToday
    }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};
