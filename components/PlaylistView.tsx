
import React, { useState, useMemo } from 'react';
import type { Playlist, Video } from '../types';
import { fetchPlaylistVideos } from '../services/geminiService';

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


const PlaylistCard: React.FC<{ playlist: Playlist; index: number; onSelect: () => void; }> = ({ playlist, index, onSelect }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `https://www.youtube.com/playlist?list=${playlist.id}`;
      navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div 
      onClick={onSelect}
      className="cursor-pointer bg-brand-surface border border-brand-surface-light rounded-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:border-brand-text/80 animate-entry relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative">
        <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-2 left-4 right-4">
          <h4 className="font-bold text-lg text-white truncate" title={playlist.title}>{playlist.title}</h4>
        </div>
        <div className="absolute top-2 right-2 bg-brand-bg/80 text-brand-text text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          <span>{playlist.videoCount} Videos</span>
        </div>
      </div>
      <div className="p-4 flex justify-between items-start gap-2">
        <p className="text-sm text-brand-text-secondary line-clamp-2 flex-1" title={playlist.description}>
          {playlist.description || 'No description available.'}
        </p>
        <button
            onClick={handleShare}
            className="p-1.5 text-brand-text-secondary hover:text-brand-accent hover:bg-brand-surface-light rounded-md transition-colors relative"
            title="Copy Link"
        >
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            )}
        </button>
      </div>
    </div>
  );
};

const PlaylistVideosView: React.FC<{ playlist: Playlist; videos: Video[]; onBack: () => void; }> = ({ playlist, videos, onBack }) => {
    const [videoToConfirm, setVideoToConfirm] = useState<Video | null>(null);
    type SortOption = 'newest' | 'oldest' | 'mostViews' | 'leastViews' | 'mostLikes' | 'leastLikes';
    const [sortOption, setSortOption] = useState<SortOption>('newest');

    const sortedVideos = useMemo(() => {
        const sorted = [...videos]; // Create a mutable copy
        switch (sortOption) {
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
            case 'mostViews':
                return sorted.sort((a, b) => b.views - a.views);
            case 'leastViews':
                return sorted.sort((a, b) => a.views - b.views);
            case 'mostLikes':
                return sorted.sort((a, b) => b.likes - a.likes);
            case 'leastLikes':
                return sorted.sort((a, b) => a.likes - b.likes);
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        }
    }, [videos, sortOption]);

    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-brand-surface-light transition-colors flex-shrink-0" aria-label="Back to playlists">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-brand-text truncate" title={playlist.title}>{playlist.title}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <label htmlFor="sort-videos" className="text-sm font-medium text-brand-text-secondary flex-shrink-0">Sort by:</label>
                    <select
                        id="sort-videos"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="bg-brand-surface-light border border-brand-surface-light rounded-md py-1.5 pl-2 pr-8 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-accent appearance-none bg-no-repeat"
                        style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em 1.25em'}}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="mostViews">Most Views</option>
                        <option value="leastViews">Least Views</option>
                        <option value="mostLikes">Most Likes</option>
                        <option value="leastLikes">Least Likes</option>
                    </select>
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-brand-surface-light">
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary hidden sm:table-cell w-28">Thumbnail</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary">Title</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary">Date</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary text-right">Views</th>
                            <th className="p-2 sm:p-3 text-sm font-semibold text-brand-text-secondary text-right">Likes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedVideos.map((video, index) => (
                            <tr 
                                key={video.id} 
                                className="border-b border-brand-surface-light last:border-b-0 hover:bg-brand-surface-light/50 transition-colors duration-200 animate-entry cursor-pointer"
                                style={{ animationDelay: `${index * 30}ms` }}
                                onClick={() => setVideoToConfirm(video)}
                            >
                                <td className="p-2 sm:p-3 hidden sm:table-cell">
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-14 rounded-md object-cover" />
                                </td>
                                <td className="p-2 sm:p-3 max-w-xs truncate" title={video.title}>{video.title}</td>
                                <td className="p-2 sm:p-3 whitespace-nowrap">{new Date(video.publishedAt).toLocaleDateString()}</td>
                                <td className="p-2 sm:p-3 text-right font-mono">{formatNumber(video.views)}</td>
                                <td className="p-2 sm:p-3 text-right font-mono">{formatNumber(video.likes)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {videoToConfirm && (
                <VideoConfirmationModal
                    video={videoToConfirm}
                    onClose={() => setVideoToConfirm(null)}
                    onConfirm={() => {
                        window.open(`https://www.youtube.com/watch?v=${videoToConfirm.id}`, '_blank');
                        setVideoToConfirm(null);
                    }}
                />
            )}
        </div>
    );
};


interface PlaylistViewProps {
  playlists: Playlist[];
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlists }) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectPlaylist = async (playlist: Playlist) => {
        if (playlist.videoCount === 0) return; // Don't fetch empty playlists
        setSelectedPlaylist(playlist);
        setIsLoading(true);
        setError(null);
        setPlaylistVideos([]);
        try {
            const videos = await fetchPlaylistVideos(playlist.id);
            setPlaylistVideos(videos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load videos.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBack = () => {
        setSelectedPlaylist(null);
        setPlaylistVideos([]);
        setError(null);
    };

    const filteredPlaylists = useMemo(() => {
        return playlists.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [playlists, searchQuery]);

    if (selectedPlaylist) {
        return (
             <div className="animate-entry">
                {isLoading && (
                    <div className="flex items-center justify-center h-full text-center p-4">
                        <div className="flex flex-col items-center gap-4">
                            <svg className="animate-spin h-8 w-8 text-brand-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-brand-text-secondary">Loading videos for "{selectedPlaylist.title}"...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg max-w-md">
                            <h3 className="text-xl font-bold mb-2">Loading Failed</h3>
                            <p className="mb-4">{error}</p>
                             <button onClick={handleBack} className="px-4 py-2 bg-brand-surface-light rounded-md text-sm font-semibold hover:bg-brand-surface-light/80 hover:text-white">
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
                {!isLoading && !error && (
                    <PlaylistVideosView playlist={selectedPlaylist} videos={playlistVideos} onBack={handleBack} />
                )}
            </div>
        );
    }


  return (
    <div className="space-y-6 sm:space-y-8 animate-entry">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">Channel Playlists</h2>
            <p className="text-brand-text-secondary">Browse through the public playlists available on the channel.</p>
        </div>
        <div className="w-full sm:w-64">
             <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search playlists..."
                    className="w-full bg-brand-bg border border-brand-surface-light rounded-md py-2 pl-10 pr-4 text-sm text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        </div>
      </div>

      {filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPlaylists.map((playlist, index) => (
            <PlaylistCard key={playlist.id} playlist={playlist} index={index} onSelect={() => handleSelectPlaylist(playlist)} />
          ))}
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-8 text-center">
            <p className="text-brand-text-secondary">{playlists.length === 0 ? "This channel doesn't have any public playlists." : "No playlists match your search."}</p>
        </div>
      )}
    </div>
  );
};
