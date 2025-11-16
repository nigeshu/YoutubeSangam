import React, { useState, useMemo } from 'react';
import type { Video } from '../types';

interface CalendarViewProps {
  videos: Video[];
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_MOBILE = ["S", "M", "T", "W", "T", "F", "S"];

const getUTCDateKey = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ videos }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const videosByDate = useMemo(() => {
    const map = new Map<string, Video[]>();
    videos.forEach(video => {
      // Use actualStartTime for live videos if available, otherwise fall back to publishedAt
      const dateString = video.type === 'live' && video.actualStartTime ? video.actualStartTime : video.publishedAt;
      const videoDate = new Date(dateString);
      const dateKey = getUTCDateKey(videoDate);
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(video);
    });
    return map;
  }, [videos]);

  const year = displayDate.getUTCFullYear();
  const month = displayDate.getUTCMonth();

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const changeMonth = (offset: number) => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setUTCDate(1); // Avoid month-end issues
      newDate.setUTCMonth(newDate.getUTCMonth() + offset);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const todayUTCKey = getUTCDateKey(new Date());
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b border-brand-surface-light"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateKey = getUTCDateKey(date);
      const isToday = dateKey === todayUTCKey;
      const todaysVideos = videosByDate.get(dateKey) || [];

      days.push(
        <div 
          key={day} 
          className="border-r border-b border-brand-surface-light p-1 sm:p-2 min-h-[100px] sm:min-h-[140px] flex flex-col relative hover:bg-brand-surface-light/50 transition-colors duration-200 animate-entry"
          style={{ animationDelay: `${(firstDayOfMonth + day) * 15}ms` }}
        >
          <span className={`text-sm sm:text-base font-semibold ${isToday ? 'text-brand-accent' : 'text-brand-text-secondary'}`}>{day}</span>
          <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
            {todaysVideos.map(video => {
               let typeClasses = 'bg-brand-surface-light text-brand-text-secondary';
                if (video.type === 'live') {
                    typeClasses = 'border border-brand-text text-brand-text';
                } else if (video.type === 'short') {
                    typeClasses = 'bg-brand-surface-light/50 text-brand-text-secondary';
                }
              return (
              <div 
                key={video.id} 
                className={`p-1 sm:p-1.5 rounded text-[10px] sm:text-xs truncate cursor-pointer transition-all ${typeClasses}`} 
                title={video.title}
              >
                <span className="hidden sm:inline-block capitalize">{video.type}: </span>
                {video.title}
              </div>
            )})}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-brand-surface rounded-lg p-4 sm:p-6 border border-brand-surface-light animate-entry">
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