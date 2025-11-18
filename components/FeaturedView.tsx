
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
        ? 'bg-brand-accent text-gray-900'
        : 'bg-brand-surface-light text-brand-text-secondary hover:bg-brand-surface-light/80 hover:text-brand-text'
    }`}
  >
    {label}
  </button>
);

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
};

const VideoConfirmationModal = ({ video, onClose, onConfirm }: { video: Video | null, onClose: () => void, onConfirm: () => void }) => {
  if (!video) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-entry"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-brand-surface border border-brand-surface-light rounded-lg p-6 w-full max-w-md relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-brand-text-secondary hover:text-brand-text"
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-surface-light">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-brand-text mt-4">Watch on YouTube?</h3>
        <p className="text-brand-text-secondary mt-2">Do you want to see the full video?</p>
        <p className="font-semibold text-brand-text mt-1 truncate" title={video.title}>"{video.title}"</p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-brand-accent text-base font-medium text-gray-900 hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent sm:w-auto sm:text-sm"
          >
            Yes, watch now
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-brand-surface-light px-4 py-2 bg-brand-surface-light text-base font-medium text-brand-text hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:w-auto sm:text-sm"
          >
            No, cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const FeaturedView: React.FC<FeaturedViewProps> = ({ videos }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const ITEMS_PER_PAGE = 10;

    const filteredVideos = useMemo(() => {
        let result = videos;
        
        if (filter !== 'all') {
            result = result.filter(video => video.type === filter);
        }

        if (searchQuery.trim()) {
            result = result.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return result;
    }, [videos, filter, searchQuery]);

    const paginatedVideos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredVideos, currentPage]);

    const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    }
    
    const chartData = useMemo(() => {
        // Use videos (filtered by type only if needed, but usually top 10 overall is better for context)
        // But showing Top 10 of filtered view is also valid. Let's stick to overall top 10 for better context
        // unless the user wants to see top 10 shorts specifically.
        // Let's use filteredVideos to make the chart dynamic based on selection.
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

        <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6 animate-entry" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-bold mb-4">Top 10 Videos by Views (Filtered)</h3>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                        <XAxis type="number" stroke="#888888" tickFormatter={(tick) => formatNumber(tick)} />
                        <YAxis type="category" dataKey="name" stroke="#888888" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip
                            cursor={{ fill: '#2C2C2C' }}
                            contentStyle={{
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #2C2C2C',
                                borderRadius: '0.5rem',
                            }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Bar dataKey="Views" fill="#EAEAEA" />
                        <Bar dataKey="Likes" fill="#888888" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6 animate-entry" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                 <h3 className="text-lg font-bold whitespace-nowrap">Content List</h3>
                 
                 <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search content..."
                            className="w-full bg-brand-bg border border-brand-surface-light rounded-md py-2 pl-10 pr-4 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterButton label="All" isActive={filter === 'all'} onClick={() => handleFilterChange('all')} />
                        <FilterButton label="Videos" isActive={filter === 'video'} onClick={() => handleFilterChange('video')} />
                        <FilterButton label="Live" isActive={filter === 'live'} onClick={() => handleFilterChange('live')} />
                        <FilterButton label="Shorts" isActive={filter === 'short'} onClick={() => handleFilterChange('short')} />
                    </div>
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
                        {paginatedVideos.length > 0 ? (
                            paginatedVideos.map((video, index) => (
                                <tr 
                                    key={video.id} 
                                    className="border-b border-brand-surface-light last:border-b-0 hover:bg-brand-surface-light/50 transition-colors duration-200 animate-entry cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => setSelectedVideo(video)}
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-brand-text-secondary">
                                    No content matches your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

             <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-brand-surface-light rounded-md text-sm font-semibold hover:bg-brand-surface-light/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                <span className="text-sm text-brand-text-secondary">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                     className="px-4 py-2 bg-brand-surface-light rounded-md text-sm font-semibold hover:bg-brand-surface-light/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>

        {selectedVideo && (
            <VideoConfirmationModal
                video={selectedVideo}
                onClose={() => setSelectedVideo(null)}
                onConfirm={() => {
                    window.open(`https://www.youtube.com/watch?v=${selectedVideo.id}`, '_blank');
                    setSelectedVideo(null);
                }}
            />
        )}
    </div>
  );
};
