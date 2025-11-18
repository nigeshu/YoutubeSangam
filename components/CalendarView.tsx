
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

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

const DayDetailsModal = ({ date, videos, onClose }: { date: Date, videos: Video[], onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-entry" onClick={onClose}>
        <div
            className="bg-brand-surface border border-brand-surface-light rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
             <div className="p-4 border-b border-brand-surface-light flex justify-between items-center bg-brand-surface rounded-t-lg sticky top-0 z-10">
                <h3 className="text-lg font-bold text-brand-text">
                    {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 text-brand-text-secondary hover:text-brand-text rounded-full hover:bg-brand-surface-light transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
             </div>

             <div className="p-4 overflow-y-auto space-y-3">
                {videos.length === 0 ? (
                    <p className="text-brand-text-secondary text-center py-4">No content uploaded on this day.</p>
                ) : (
                    videos.map(video => (
                        <a
                            key={video.id}
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-4 p-3 rounded-lg hover:bg-brand-surface-light/50 transition-colors group border border-transparent hover:border-brand-surface-light"
                        >
                            <div className="relative w-40 h-24 flex-shrink-0">
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-md" />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1.5 py-0.5 rounded text-white capitalize font-bold shadow-sm">
                                    {video.type}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-lg font-bold text-brand-text line-clamp-2 group-hover:text-brand-accent transition-colors" title={video.title}>
                                    {video.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-brand-text-secondary font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        {formatNumber(video.views)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.672l1.318-1.354a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                                        {formatNumber(video.likes)}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
             </div>
        </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ videos }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ date: Date, videos: Video[] } | null>(null);

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
          onClick={() => setSelectedDay({ date, videos: todaysVideos })}
          className="border-r border-b border-brand-surface-light p-1 sm:p-2 min-h-[100px] sm:min-h-[140px] flex flex-col relative hover:bg-brand-surface-light/50 transition-colors duration-200 animate-entry cursor-pointer group"
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
                className={`p-1 sm:p-1.5 rounded text-[10px] sm:text-xs truncate transition-all ${typeClasses}`} 
                title={video.title}
              >
                <span className="hidden sm:inline-block capitalize">{video.type}: </span>
                {video.title}
              </div>
            )})}
          </div>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-brand-surface rounded-lg p-4 sm:p-6 border border-brand-surface-light animate-entry relative">
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

      {selectedDay && (
        <DayDetailsModal 
            date={selectedDay.date} 
            videos={selectedDay.videos} 
            onClose={() => setSelectedDay(null)} 
        />
      )}
    </div>
  );
};
