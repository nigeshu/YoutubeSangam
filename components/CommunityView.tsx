
import React, { useState, useEffect } from 'react';
import type { Video, Comment } from '../types';
import { fetchVideoComments } from '../services/geminiService';

interface CommunityViewProps {
  videos: Video[];
}

const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const CommentCard: React.FC<{ 
    comment: Comment; 
}> = ({ comment }) => {
    
    const commentUrl = `https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.id}`;

    return (
        <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-4 animate-entry">
            <div className="flex gap-3">
                <img 
                    src={comment.authorProfileImageUrl} 
                    alt={comment.authorDisplayName} 
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-brand-text text-sm">{comment.authorDisplayName}</span>
                        <span className="text-xs text-brand-text-secondary">{timeAgo(comment.publishedAt)}</span>
                        {comment.videoTitle && (
                            <span className="text-xs text-brand-accent/70 truncate max-w-[200px] hidden sm:inline-block" title={`On: ${comment.videoTitle}`}>
                                • on {comment.videoTitle}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-brand-text text-sm whitespace-pre-wrap leading-relaxed">{comment.textDisplay}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-brand-text-secondary text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span>{comment.likeCount}</span>
                        </div>
                        <a 
                            href={commentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-brand-text-secondary hover:text-brand-accent transition-colors flex items-center gap-1.5"
                        >
                            Reply on YouTube
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CommunityView: React.FC<CommunityViewProps> = ({ videos }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadComments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch comments for the latest 5 videos to create a "feed"
                const latestVideos = videos.slice(0, 5);
                const commentsPromises = latestVideos.map(async (video) => {
                    const videoComments = await fetchVideoComments(video.id);
                    // Add video context to each comment
                    return videoComments.map(c => ({ ...c, videoTitle: video.title }));
                });

                const results = await Promise.all(commentsPromises);
                const flatComments = results.flat();
                
                // Sort by date (newest first)
                const sortedComments = flatComments.sort((a, b) => 
                    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
                );

                setComments(sortedComments);
            } catch (err) {
                console.error("Failed to load community feed:", err);
                setError("Failed to load comments. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (videos.length > 0) {
            loadComments();
        } else {
            setIsLoading(false);
        }
    }, [videos]);

    return (
        <div className="space-y-6 sm:space-y-8 animate-entry max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-1">Community</h2>
                <p className="text-brand-text-secondary">Latest comments from your recent videos. Engage with your audience on YouTube.</p>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                     <svg className="animate-spin h-8 w-8 text-brand-text mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <p className="text-brand-text-secondary">Gathering comments...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-red-300 text-center">
                    {error}
                </div>
            )}

            {!isLoading && !error && comments.length === 0 && (
                <div className="bg-brand-surface border border-brand-surface-light rounded-lg p-8 text-center">
                    <p className="text-brand-text-secondary">No comments found on your recent videos.</p>
                </div>
            )}

            <div className="space-y-4">
                {comments.map(comment => (
                    <CommentCard 
                        key={comment.id} 
                        comment={comment} 
                    />
                ))}
            </div>
        </div>
    );
};
