
export interface Video {
  id: string;
  title: string;
  type: 'video' | 'live' | 'short';
  publishedAt: string; // ISO 8601 string
  actualStartTime?: string; // ISO 8601 string for live streams
  thumbnailUrl: string;
  views: number;
  likes: number;
}

export interface ChannelInfo {
  name: string;
  subscribers: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  publishedAt: string; // ISO 8601 string
}

export interface Goal {
    id: string;
    userId: string;
    text: string;
    isCompleted: boolean;
    createdAt: any; // Firebase Timestamp
}

// From RAWG API
export interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  released: string;
}

// Stored in Firestore
export interface LibraryGame {
  id: string; // Firestore doc ID
  userId: string;
  gameId: number; // RAWG game ID
  name: string;
  backgroundImage: string;
  released: string;
  status: 'Planned' | 'Playing' | 'Completed' | 'Pause' | 'Gave Up';
  addedAt: any; // Firebase Timestamp
  rating?: number; // User rating from 0 to 5
}

export interface Comment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
  videoId: string;
  videoTitle?: string;
  replies?: Comment[]; // For nested or local replies
  isOwner?: boolean; // To distinguish user replies
}
