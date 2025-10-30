import React, { useState, useMemo } from 'react';
import type { Video } from '../types';

interface CalendarViewProps {
  videos: Video[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_MOBILE = ["S", "M", "T", "W", "T", "F", "S"];

export const CalendarView: React.FC<CalendarViewProps> = ({ videos }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const videosByDate = useMemo(() => {
    const map = new Map<string, Video[]>();
    videos.forEach(video => {
      const dateKey = new Date(video.publishedAt).toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(video);
    });
    return map;
  }, [videos]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b border-brand-surface-light"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dateKey = date.toISOString().split('T')[0];
      const todaysVideos = videosByDate.get(dateKey) || [];

      days.push(
        <div 
          key={day} 
          className="border-r border-b border-brand-surface-light p-1 sm:p-2 min-h-[100px] sm:min-h-[140px] flex flex-col relative hover:bg-brand-surface-light/50 transition-colors duration-200 animate-entry"
          style={{ animationDelay: `${(firstDayOfMonth + day) * 15}ms` }}
        >
          <span className={`text-sm sm:text-base font-semibold ${isToday ? 'text-brand-accent' : 'text-brand-text-secondary'}`}>{day}</span>
          <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
            {todaysVideos.map(video => (
              <div 
                key={video.id} 
                className={`p-1 sm:p-1.5 rounded-md text-[10px] sm:text-xs truncate cursor-pointer transition-all ${video.type === 'live' ? 'bg-red-900/50 text-red-300 hover:bg-red-900/80' : 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/80'}`} 
                title={video.title}
              >
                <span className={`hidden sm:inline-block w-2 h-2 rounded-full mr-1.5 ${video.type === 'live' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                {video.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-brand-surface rounded-xl shadow-lg p-4 sm:p-6 border border-brand-surface-light animate-entry">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-brand-surface-light transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-center">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-brand-surface-light transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-brand-surface-light">
        {DAY_NAMES.map(day => (
          <div key={day} className="hidden sm:block text-center font-semibold py-2 border-r border-b border-brand-surface-light text-brand-text-secondary">{day}</div>
        ))}
         {DAY_NAMES_MOBILE.map(day => (
          <div key={day} className="sm:hidden text-center font-semibold py-2 border-r border-b border-brand-surface-light text-brand-text-secondary">{day}</div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};