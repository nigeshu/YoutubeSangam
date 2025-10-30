import React, { useMemo, useState, useEffect } from 'react';
import type { Video } from '../types';

interface AnalyticsViewProps {
  videos: Video[];
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

const useCountUp = (end: number, duration = 1500) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let start = 0;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it ends on the exact number
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};


const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactElement }) => {
    const animatedValue = useCountUp(value);
    
    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-xl p-4 sm:p-6 flex items-start gap-4">
            <div className="bg-brand-surface-light p-3 rounded-lg text-brand-accent">
                {icon}
            </div>
            <div>
                <p className="text-sm text-brand-text-secondary font-medium">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-brand-text">{formatNumber(animatedValue)}</p>
            </div>
        </div>
    );
};

const BarChart = ({ data, title }: { data: { label: string, value: number, color: string }[], title: string }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map(({ label, value, color }) => (
                    <div key={label} className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm text-brand-text-secondary truncate">{label}</span>
                        <div className="col-span-3 bg-brand-bg rounded-full h-6 relative border border-brand-surface-light">
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(value / maxValue) * 100}%`, backgroundColor: color }}
                            ></div>
                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white z-10">{value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ videos }) => {
    const analytics = useMemo(() => {
        if (videos.length === 0) {
            return {
                totalVideos: 0,
                totalViews: 0,
                totalLikes: 0,
                avgViews: 0,
                videoCount: 0,
                liveCount: 0,
                shortCount: 0,
                uploadsByDay: [0, 0, 0, 0, 0, 0, 0],
            };
        }

        const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
        const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
        
        const videoCount = videos.filter(v => v.type === 'video').length;
        const liveCount = videos.filter(v => v.type === 'live').length;
        const shortCount = videos.filter(v => v.type === 'short').length;

        const uploadsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        videos.forEach(v => {
            const dayOfWeek = new Date(v.publishedAt).getDay();
            uploadsByDay[dayOfWeek]++;
        });

        return {
            totalVideos: videos.length,
            totalViews,
            totalLikes,
            avgViews: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
            videoCount,
            liveCount,
            shortCount,
            uploadsByDay,
        };
    }, [videos]);


    const contentBreakdownData = [
        { label: 'Videos', value: analytics.videoCount, color: '#3b82f6' }, // blue-500
        { label: 'Live Streams', value: analytics.liveCount, color: '#ef4444' }, // red-500
        { label: 'Shorts', value: analytics.shortCount, color: '#8b5cf6' }, // violet-500
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const uploadScheduleData = analytics.uploadsByDay.map((count, i) => ({
        label: dayNames[i],
        value: count,
        color: '#10b981', // emerald-500
    }));

    return (
        <div className="space-y-6 sm:space-y-8 animate-entry">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">Channel Analytics</h2>
                <p className="text-brand-text-secondary">Deep dive into the channel's performance metrics, based on the last 200 videos.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="animate-entry" style={{ animationDelay: '100ms' }}>
                    <StatCard 
                        title="Total Videos"
                        value={analytics.totalVideos}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    />
                </div>
                <div className="animate-entry" style={{ animationDelay: '200ms' }}>
                    <StatCard 
                        title="Total Views"
                        value={analytics.totalViews}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    />
                </div>
                 <div className="animate-entry" style={{ animationDelay: '300ms' }}>
                    <StatCard 
                        title="Total Likes"
                        value={analytics.totalLikes}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.5V9.5a2.5 2.5 0 012.5-2.5h1.105a2 2 0 001.952-1.558l.8-4A2 2 0 0115.336 2L12 5z" /></svg>}
                    />
                </div>
                 <div className="animate-entry" style={{ animationDelay: '400ms' }}>
                     <StatCard 
                        title="Avg. Views / Video"
                        value={analytics.avgViews}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="animate-entry" style={{ animationDelay: '500ms' }}>
                    <BarChart title="Content Breakdown" data={contentBreakdownData} />
                </div>
                 <div className="animate-entry" style={{ animationDelay: '600ms' }}>
                    <BarChart title="Upload Schedule (by Day)" data={uploadScheduleData} />
                </div>
            </div>
        </div>
    );
};