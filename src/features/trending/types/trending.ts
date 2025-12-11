// Trending types and interfaces

import type { ItemType } from '../../../types/global';

export type TimeRange = 'week' | 'month' | 'all-time';

export type SortBy =
    | 'top-rated'           // Highest average rating
    | 'most-ratings'        // Most rating count
    | 'most-commented'      // Most comment count
    | 'recently-commented'  // Latest comment timestamp
    | 'newly-tagged';       // Most recent tag additions

export interface TrendingFilters {
    timeRange: TimeRange;
    sortBy: SortBy;
    tags?: string[];           // Filter by tag IDs
    genres?: string[];         // Filter by Spotify genres
    minRating?: number;        // Minimum average rating (1-10)
    activityAge?: number;      // Max days since last activity
}

export interface TrendingItem {
    id: string;                // item_id (Spotify ID or playlist ID)
    type: ItemType;            // 'track' | 'album' | 'playlist'
    name: string;
    artist?: string;           // For tracks and albums
    imageUrl?: string;

    // Stats from item_stats table
    ratingCount: number;
    avgRating: number;
    commentCount: number;
    favoriteCount: number;
    tagCount: number;
}

export interface CommunityStats {
    totalRatings: number;
    totalComments: number;
    totalTags: number;
    totalUsers: number;
    topRatedItems: TrendingItem[];
    mostActiveUsers: {
        userId: string;
        username: string;
        activityCount: number;
    }[];
}
