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
const LikesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.672l1.318-1.354a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;


export const FeaturedCard: React.FC<FeaturedCardProps> = ({ video, title, metric }) => {
    if (!video) {
        return (
            <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 flex flex-col items-center justify-center text-center h-full min-h-[240px]">
                <h4 className="font-bold text-lg text-brand-text mb-2">{title}</h4>
                <p className="text-sm text-brand-text-secondary">No matching content found.</p>
            </div>
        );
    }
    
    const metricValue = video[metric];
    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
    const MetricIcon = metric === 'views' ? ViewsIcon : LikesIcon;

    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:border-brand-text/80">
            <div className="relative">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-brand-accent text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                    {video.type === 'live' ? 'Live Stream' : (video.type === 'short' ? 'Short' : 'Video')}
                </div>
                <div className="absolute bottom-2 left-4 right-4">
                    <h4 className="font-bold text-lg text-white truncate" title={video.title}>{video.title}</h4>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm font-semibold text-brand-text-secondary mb-2">{title}</p>
                <div className="flex items-center text-brand-text">
                    <MetricIcon />
                    <span className="font-mono font-bold text-xl">{formatNumber(metricValue)}</span>
                    <span className="ml-2 text-brand-text-secondary">{metricLabel}</span>
                </div>
            </div>
        </div>
    );
};