export interface Video {
  id: string;
  title: string;
  type: 'video' | 'live' | 'short';
  publishedAt: string; // ISO 8601 string
  thumbnailUrl: string;
  views: number;
  likes: number;
}

export interface ChannelInfo {
  name: string;
  subscribers: number;
}
