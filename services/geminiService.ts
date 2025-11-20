
import type { Video, ChannelInfo, Playlist, Comment } from '../types';

// Use the latest key provided by the user for the YouTube Data API.
const YOUTUBE_API_KEY = 'AIzaSyBDDFaeFh61IEN4C3eSx7fVFroA7kyIlnc';
const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface FetchResult {
    videos: Video[];
    channelInfo: ChannelInfo;
    playlists: Playlist[];
}

/**
 * Parses an ISO 8601 duration string (e.g., "PT2M10S") into seconds.
 * @param duration The ISO 8601 duration string.
 * @returns The total duration in seconds.
 */
const parseISO8601Duration = (duration: string): number => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    if (!matches) return 0;
    const hours = matches[1] ? parseInt(matches[1], 10) : 0;
    const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
    const seconds = matches[3] ? parseInt(matches[3], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
};


/**
 * Parses a YouTube channel URL to extract a unique identifier.
 * This can be a channel ID (UC...), a handle (@handle), or a legacy username.
 * @param url The full YouTube channel URL.
 * @returns The identifier string or null if not found.
 */
const getChannelIdentifier = (url: string): string | null => {
    try {
        const urlObject = new URL(url);
        const pathname = urlObject.pathname;
        const parts = pathname.split('/').filter(p => p);

        if (parts.length > 0) {
            if (parts[0] === 'channel') return parts[1];
            if (parts[0].startsWith('@')) return parts[0];
            if (['c', 'user'].includes(parts[0])) return parts[1];
        }
        // Fallback for root path handles e.g., youtube.com/@handle
        if (urlObject.pathname.startsWith('/@')) {
             return urlObject.pathname.substring(1);
        }
        return null;
    } catch (e) {
        if (!url.includes('/') && (url.startsWith('@') || url.startsWith('UC'))) {
            return url;
        }
        console.error("Could not parse identifier from URL:", url, e);
        return null;
    }
};

/**
 * Resolves a channel identifier to get full channel details including ID, name, uploads playlist, and subscriber count.
 * @param identifier The channel handle, username, or ID.
 * @returns An object with channel details.
 */
const getChannelDetails = async (identifier: string): Promise<{ id: string; name: string; uploadsPlaylistId: string; subscribers: number; }> => {
    let params: { [key: string]: string };
    if (identifier.startsWith('UC')) {
        params = { id: identifier };
    } else {
        // YouTube API v3 uses 'forHandle' for @handles.
        const handle = identifier.startsWith('@') ? identifier.substring(1) : identifier;
        params = { forHandle: handle };
    }
    
    const channelUrl = new URL(`${API_BASE_URL}/channels`);
    channelUrl.searchParams.append('part', 'snippet,contentDetails,statistics');
    Object.keys(params).forEach(key => channelUrl.searchParams.append(key, params[key]));
    channelUrl.searchParams.append('key', YOUTUBE_API_KEY);

    const response = await fetch(channelUrl.toString());
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || `Failed to find channel for: ${identifier}`);
    if (!data.items || data.items.length === 0) throw new Error(`Could not find a channel for: ${identifier}`);
    
    const channel = data.items[0];
    return {
        id: channel.id,
        name: channel.snippet.title,
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
        subscribers: parseInt(channel.statistics.subscriberCount, 10),
    };
};


/**
 * Fetches channel video data using the YouTube Data API v3.
 * @param channelUrl The URL of the YouTube channel.
 * @returns A promise that resolves to an object containing an array of Video objects and channel info.
 */
export const fetchChannelData = async (channelUrl: string): Promise<FetchResult> => {
    const identifier = getChannelIdentifier(channelUrl);
    if (!identifier) {
        throw new Error("Could not find a valid channel identifier in the URL. Use a format like 'https://youtube.com/@handle'.");
    }

    try {
        const { id: channelId, name, uploadsPlaylistId, subscribers } = await getChannelDetails(identifier);

        // --- Fetch Videos ---
        let allVideoIds: string[] = [];
        let nextPageToken: string | undefined = undefined;
        const MAX_VIDEOS_TO_FETCH = 200;

        do {
            const playlistItemsUrl = new URL(`${API_BASE_URL}/playlistItems`);
            playlistItemsUrl.searchParams.append('part', 'contentDetails');
            playlistItemsUrl.searchParams.append('playlistId', uploadsPlaylistId);
            playlistItemsUrl.searchParams.append('maxResults', '50');
            playlistItemsUrl.searchParams.append('key', YOUTUBE_API_KEY);
            if (nextPageToken) {
                playlistItemsUrl.searchParams.append('pageToken', nextPageToken);
            }

            const playlistResponse = await fetch(playlistItemsUrl.toString());
            const playlistData = await playlistResponse.json();
            if (!playlistResponse.ok) throw new Error(playlistData.error?.message || 'Could not fetch playlist videos.');
            if (!playlistData.items) break;

            const newVideoIds = playlistData.items.map((item: any) => item.contentDetails.videoId);
            allVideoIds = [...allVideoIds, ...newVideoIds];
            
            nextPageToken = playlistData.nextPageToken;

        } while (nextPageToken && allVideoIds.length < MAX_VIDEOS_TO_FETCH);

        let finalVideos: Video[] = [];
        if (allVideoIds.length > 0) {
            const allVideoItems: any[] = [];
            const BATCH_SIZE = 50;

            for (let i = 0; i < allVideoIds.length; i += BATCH_SIZE) {
                const videoIdsBatch = allVideoIds.slice(i, i + BATCH_SIZE);
                const videoIdsString = videoIdsBatch.join(',');
                
                const videoDetailsUrl = `${API_BASE_URL}/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIdsString}&key=${YOUTUBE_API_KEY}`;
                const videosResponse = await fetch(videoDetailsUrl);
                const videosData = await videosResponse.json();
                if (!videosResponse.ok) throw new Error(videosData.error?.message || 'Could not fetch video details.');
                
                allVideoItems.push(...videosData.items);
            }

            finalVideos = allVideoItems.map((item: any): Video => {
                const views = item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0;
                const likes = item.statistics?.likeCount ? parseInt(item.statistics.likeCount, 10) : 0;
                const duration = item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 0;

                let videoType: 'video' | 'live' | 'short' = 'video';
                const actualStartTime = item.liveStreamingDetails?.actualStartTime;
                
                if (item.liveStreamingDetails) {
                    videoType = 'live';
                } 
                else if (duration > 0 && duration <= 60) {
                    videoType = 'short';
                }

                return {
                    id: item.id,
                    title: item.snippet.title,
                    type: videoType,
                    publishedAt: item.snippet.publishedAt,
                    actualStartTime: actualStartTime,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                    views,
                    likes,
                };
            });
        }
        
        // --- Fetch Playlists ---
        const playlistsUrl = new URL(`${API_BASE_URL}/playlists`);
        playlistsUrl.searchParams.append('part', 'snippet,contentDetails');
        playlistsUrl.searchParams.append('channelId', channelId);
        playlistsUrl.searchParams.append('maxResults', '50');
        playlistsUrl.searchParams.append('key', YOUTUBE_API_KEY);
        
        const playlistsResponse = await fetch(playlistsUrl.toString());
        const playlistsData = await playlistsResponse.json();
        if (!playlistsResponse.ok) throw new Error(playlistsData.error?.message || 'Could not fetch playlists.');

        const playlists: Playlist[] = playlistsData.items?.map((item: any): Playlist => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            videoCount: item.contentDetails.itemCount,
            publishedAt: item.snippet.publishedAt,
        })) || [];
        
        const sortedVideos = finalVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        return {
            videos: sortedVideos,
            channelInfo: { id: channelId, name, subscribers },
            playlists: playlists.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        };

    } catch (error) {
        console.error("YouTube API Error:", error);
        throw new Error(`Failed to fetch data from YouTube. ${error instanceof Error ? error.message : 'Please check the console for details.'}`);
    }
};


/**
 * Fetches all videos within a specific playlist.
 * @param playlistId The ID of the YouTube playlist.
 * @returns A promise that resolves to an array of Video objects.
 */
export const fetchPlaylistVideos = async (playlistId: string): Promise<Video[]> => {
    try {
        let allVideoIds: string[] = [];
        let nextPageToken: string | undefined = undefined;

        // 1. Get all video IDs from the playlist
        do {
            const playlistItemsUrl = new URL(`${API_BASE_URL}/playlistItems`);
            playlistItemsUrl.searchParams.append('part', 'contentDetails');
            playlistItemsUrl.searchParams.append('playlistId', playlistId);
            playlistItemsUrl.searchParams.append('maxResults', '50');
            playlistItemsUrl.searchParams.append('key', YOUTUBE_API_KEY);
            if (nextPageToken) {
                playlistItemsUrl.searchParams.append('pageToken', nextPageToken);
            }

            const playlistResponse = await fetch(playlistItemsUrl.toString());
            const playlistData = await playlistResponse.json();
            if (!playlistResponse.ok) throw new Error(playlistData.error?.message || 'Could not fetch playlist items.');
            if (!playlistData.items) break;

            const newVideoIds = playlistData.items
                .map((item: any) => item.contentDetails.videoId)
                .filter(Boolean); // Filter out any null/undefined IDs
            allVideoIds = [...allVideoIds, ...newVideoIds];
            
            nextPageToken = playlistData.nextPageToken;

        } while (nextPageToken);

        if (allVideoIds.length === 0) return [];

        // 2. Fetch details for all video IDs in batches
        const allVideoItems: any[] = [];
        const BATCH_SIZE = 50;

        for (let i = 0; i < allVideoIds.length; i += BATCH_SIZE) {
            const videoIdsBatch = allVideoIds.slice(i, i + BATCH_SIZE);
            const videoIdsString = videoIdsBatch.join(',');
            
            const videoDetailsUrl = `${API_BASE_URL}/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIdsString}&key=${YOUTUBE_API_KEY}`;
            const videosResponse = await fetch(videoDetailsUrl);
            const videosData = await videosResponse.json();
            if (!videosResponse.ok) throw new Error(videosData.error?.message || 'Could not fetch video details.');
            
            allVideoItems.push(...videosData.items);
        }

        // 3. Map the data to our Video type
        const finalVideos = allVideoItems.map((item: any): Video => {
            const views = item.statistics?.viewCount ? parseInt(item.statistics.viewCount, 10) : 0;
            const likes = item.statistics?.likeCount ? parseInt(item.statistics.likeCount, 10) : 0;
            const duration = item.contentDetails?.duration ? parseISO8601Duration(item.contentDetails.duration) : 0;

            let videoType: 'video' | 'live' | 'short' = 'video';
            const actualStartTime = item.liveStreamingDetails?.actualStartTime;
            
            if (item.liveStreamingDetails) {
                videoType = 'live';
            } 
            else if (duration > 0 && duration <= 60) {
                videoType = 'short';
            }

            return {
                id: item.id,
                title: item.snippet.title,
                type: videoType,
                publishedAt: item.snippet.publishedAt,
                actualStartTime: actualStartTime,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                views,
                likes,
            };
        });

        return finalVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    } catch (error) {
        console.error("YouTube API Error fetching playlist videos:", error);
        throw new Error(`Failed to fetch playlist videos. ${error instanceof Error ? error.message : 'Please check the console for details.'}`);
    }
};

/**
 * Fetches comments for a specific video.
 * @param videoId The ID of the video.
 * @returns A promise that resolves to an array of Comment objects.
 */
export const fetchVideoComments = async (videoId: string): Promise<Comment[]> => {
    try {
        const url = new URL(`${API_BASE_URL}/commentThreads`);
        url.searchParams.append('part', 'snippet');
        url.searchParams.append('videoId', videoId);
        url.searchParams.append('maxResults', '10'); // Limit to top 10 comments per video for performance
        url.searchParams.append('key', YOUTUBE_API_KEY);
        url.searchParams.append('textFormat', 'plainText');

        const response = await fetch(url.toString());
        const data = await response.json();

        if (!response.ok) {
            // Comments might be disabled for a video, which returns a 403. We should just return empty.
            if (response.status === 403) return [];
            throw new Error(data.error?.message || 'Could not fetch comments.');
        }

        if (!data.items) return [];

        return data.items.map((item: any): Comment => {
            const snippet = item.snippet.topLevelComment.snippet;
            return {
                id: item.id,
                authorDisplayName: snippet.authorDisplayName,
                authorProfileImageUrl: snippet.authorProfileImageUrl,
                textDisplay: snippet.textDisplay,
                publishedAt: snippet.publishedAt,
                likeCount: snippet.likeCount,
                videoId: videoId,
            };
        });

    } catch (error) {
        console.error(`Error fetching comments for video ${videoId}:`, error);
        return [];
    }
};