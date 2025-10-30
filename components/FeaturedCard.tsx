import React from 'react';
import type { Video } from '../types';

interface FeaturedCardProps {
  video: Video | null;
  title: string;
  metric: 'views' | 'likes';
}

const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
};

const ViewsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const LikesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.5V9.5a2.5 2.5 0 012.5-2.5h1.105a2 2 0 001.952-1.558l.8-4A2 2 0 0115.336 2L12 5z" /></svg>;


export const FeaturedCard: React.FC<FeaturedCardProps> = ({ video, title, metric }) => {
    if (!video) {
        return (
            <div className="bg-brand-surface border border-brand-surface-light rounded-xl shadow-lg p-4 flex flex-col items-center justify-center text-center h-full min-h-[240px]">
                <h4 className="font-bold text-lg text-brand-text mb-2">{title}</h4>
                <p className="text-sm text-brand-text-secondary">No matching content found.</p>
            </div>
        );
    }
    
    const metricValue = video[metric];
    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
    const MetricIcon = metric === 'views' ? ViewsIcon : LikesIcon;

    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-xl shadow-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:border-brand-accent/50">
            <div className="relative">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {video.type === 'live' ? 'Live Stream' : (video.type === 'short' ? 'Short' : 'Video')}
                </div>
                <div className="absolute bottom-2 left-4 right-4">
                    <h4 className="font-bold text-lg text-white truncate" title={video.title}>{video.title}</h4>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm font-semibold text-brand-accent mb-2">{title}</p>
                <div className="flex items-center text-brand-text">
                    <MetricIcon />
                    <span className="font-mono font-bold text-xl">{formatNumber(metricValue)}</span>
                    <span className="ml-2 text-brand-text-secondary">{metricLabel}</span>
                </div>
            </div>
        </div>
    );
};