import React, { useState, useMemo } from 'react';
import type { Video } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FeaturedViewProps {
  videos: Video[];
}

type FilterType = 'all' | 'video' | 'live' | 'short';

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-white'
        : 'bg-brand-surface-light text-brand-text-secondary hover:bg-brand-accent/50 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

export const FeaturedView: React.FC<FeaturedViewProps> = ({ videos }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<FilterType>('all');
    const ITEMS_PER_PAGE = 10;

    const filteredVideos = useMemo(() => {
        if (filter === 'all') {
            return videos;
        }
        return videos.filter(video => video.type === filter);
    }, [videos, filter]);

    const paginatedVideos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredVideos, currentPage]);

    const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };
    
    const chartData = useMemo(() => {
        return [...filteredVideos]
            .sort((a,b) => b.views - a.views)
            .slice(0, 10)
            .map(video => ({
                name: video.title.length > 15 ? `${video.title.substring(0, 15)}...` : video.title,
                fullTitle: video.title,
                Views: video.views,
                Likes: video.likes,
            }))
            .reverse();
    }, [filteredVideos]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-entry">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">Content Analysis</h2>
            <p className="text-brand-text-secondary">Explore top performing videos and browse all content.</p>
        </div>

        <div className="bg-brand-surface border border-brand-surface-light rounded-xl shadow-lg p-4 sm:p-6 animate-entry" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-bold mb-4">Top 10 Videos by Views</h3>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" tickFormatter={(tick) => formatNumber(tick)} />
                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip
                            cursor={{ fill: '#374151' }}
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '0.5rem',
                            }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Bar dataKey="Views" fill="#10B981" />
                        <Bar dataKey="Likes" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-brand-surface border border-brand-surface-light rounded-xl shadow-lg p-4 sm:p-6 animate-entry" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                 <h3 className="text-lg font-bold">Content List</h3>
                 <div className="flex items-center gap-2 flex-wrap">
                    <FilterButton label="All" isActive={filter === 'all'} onClick={() => handleFilterChange('all')} />
                    <FilterButton label="Videos" isActive={filter === 'video'} onClick={() => handleFilterChange('video')} />
                    <FilterButton label="Live" isActive={filter === 'live'} onClick={() => handleFilterChange('live')} />
                    <FilterButton label="Shorts" isActive={filter === 'short'} onClick={() => handleFilterChange('short')} />
                 </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-brand-surface-light">
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary hidden sm:table-cell w-28">Thumbnail</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary">Title</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary">Type</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary">Date</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary text-right">Views</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary text-right">Likes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedVideos.map((video, index) => (
                            <tr 
                                key={video.id} 
                                className="border-b border-brand-surface-light last:border-b-0 hover:bg-brand-surface-light/50 hover:scale-[1.02] transition-transform duration-200 animate-entry"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="p-2 sm:p-3 hidden sm:table-cell">
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 rounded-md object-cover" />
                                </td>
                                <td className="p-2 sm:p-3 max-w-xs truncate" title={video.title}>{video.title}</td>
                                <td className="p-2 sm:p-3 capitalize">{video.type}</td>
                                <td className="p-2 sm:p-3 whitespace-nowrap">{new Date(video.type === 'live' && video.actualStartTime ? video.actualStartTime : video.publishedAt).toLocaleDateString()}</td>
                                <td className="p-2 sm:p-3 text-right font-mono">{formatNumber(video.views)}</td>
                                <td className="p-2 sm:p-3 text-right font-mono">{formatNumber(video.likes)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-brand-surface-light rounded-md text-sm font-semibold hover:bg-brand-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                <span className="text-sm text-brand-text-secondary">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                     className="px-4 py-2 bg-brand-surface-light rounded-md text-sm font-semibold hover:bg-brand-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
  );
};