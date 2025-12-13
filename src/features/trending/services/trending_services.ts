// Trending services - fetch and filter trending content

import { supabase } from '../../../lib/supabaseClient';
import type { TrendingFilters, TrendingItem, CommunityStats, TimeRange, SortBy } from '../types/trending';
import type { ItemType } from '../../../types/global';

/**
 * Get the date threshold based on time range
 * NOTE: Time filtering is currently not supported because item_stats table
 * doesn't have timestamp columns for last activity
 */
function getTimeThreshold(timeRange: TimeRange): string | null {
    const now = new Date();

    switch (timeRange) {
        case 'week':
            now.setDate(now.getDate() - 7);
            return now.toISOString();
        case 'month':
            now.setDate(now.getDate() - 30);
            return now.toISOString();
        case 'all-time':
            return null; // No time filter
        default:
            return null;
    }
}

/**
 * Build the ORDER BY clause based on sort option
 */
function getSortClause(sortBy: SortBy): { column: string; ascending: boolean } {
    switch (sortBy) {
        case 'top-rated':
            return { column: 'average_rating', ascending: false };
        case 'most-ratings':
            return { column: 'rating_count', ascending: false };
        case 'most-commented':
            return { column: 'comment_count', ascending: false };
        case 'most-favorited':
            return { column: 'favorite_count', ascending: false };
        case 'most-activity':
            // Sort by rating_count as proxy for overall activity
            // (items with more ratings tend to have more overall engagement)
            return { column: 'rating_count', ascending: false };
        case 'recently-commented':
            // Fallback to comment count since we don't have timestamps
            return { column: 'comment_count', ascending: false };
        case 'newly-tagged':
            // Fallback to tag count since we don't have timestamps
            return { column: 'tag_count', ascending: false };
        default:
            return { column: 'average_rating', ascending: false };
    }
}

/**
 * Fetch trending tracks with filters
 */
export async function getTrendingTracks(
    filters: TrendingFilters,
    limit = 50
): Promise<TrendingItem[]> {
    return getTrendingItems('track', filters, limit);
}

/**
 * Fetch trending albums with filters
 */
export async function getTrendingAlbums(
    filters: TrendingFilters,
    limit = 50
): Promise<TrendingItem[]> {
    return getTrendingItems('album', filters, limit);
}

/**
 * Fetch trending playlists with filters
 */
export async function getTrendingPlaylists(
    filters: TrendingFilters,
    limit = 50
): Promise<TrendingItem[]> {
    return getTrendingItems('playlist', filters, limit);
}

/**
 * Generic function to fetch trending items
 */
async function getTrendingItems(
    itemType: ItemType,
    filters: TrendingFilters,
    limit: number
): Promise<TrendingItem[]> {
    try {
        // Start with base query from item_stats
        let query = supabase
            .from('item_stats')
            .select(`
        item_id,
        item_type,
        average_rating,
        rating_count,
        comment_count,
        favorite_count,
        tag_count
      `)
            .eq('item_type', itemType);

        // Apply minimum rating filter
        if (filters.minRating) {
            query = query.gte('average_rating', filters.minRating);
        }

        // Apply sorting
        const sortClause = getSortClause(filters.sortBy);
        query = query.order(sortClause.column, { ascending: sortClause.ascending, nullsFirst: false });

        // Limit results
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching trending items:', error);
            throw new Error(`Failed to fetch trending ${itemType}s: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Filter by tags if specified
        let filteredData = data;
        if (filters.tags && filters.tags.length > 0) {
            filteredData = await filterByTags(data, filters.tags);
        }

        // Map to TrendingItem format
        const trendingItems: TrendingItem[] = filteredData.map(item => ({
            id: item.item_id,
            type: item.item_type as ItemType,
            name: '', // Will be populated from Spotify API or playlists table
            ratingCount: item.rating_count || 0,
            avgRating: item.average_rating || 0,
            commentCount: item.comment_count || 0,
            favoriteCount: item.favorite_count || 0,
            tagCount: item.tag_count || 0,
        }));

        // Enrich with metadata (name, artist, image)
        return await enrichWithMetadata(trendingItems);

    } catch (error) {
        console.error('Error in getTrendingItems:', error);
        throw error;
    }
}

/**
 * Filter items by tags
 */
async function filterByTags(items: any[], tagIds: string[]): Promise<any[]> {
    const itemIds = items.map(item => item.item_id);

    const { data, error } = await supabase
        .from('item_tags')
        .select('item_id')
        .in('item_id', itemIds)
        .in('tag_id', tagIds);

    if (error) {
        console.error('Error filtering by tags:', error);
        return items;
    }

    const itemsWithTags = new Set(data.map(t => t.item_id));
    return items.filter(item => itemsWithTags.has(item.item_id));
}

/**
 * Enrich trending items with metadata from Spotify API or playlists table
 */
async function enrichWithMetadata(items: TrendingItem[]): Promise<TrendingItem[]> {
    // Separate items by type
    const playlists = items.filter(item => item.type === 'playlist');
    const tracks = items.filter(item => item.type === 'track');
    const albums = items.filter(item => item.type === 'album');

    // Fetch playlist metadata from database
    if (playlists.length > 0) {
        const playlistIds = playlists.map(p => p.id);
        const { data: playlistData } = await supabase
            .from('playlists')
            .select('id, title, description, color')
            .in('id', playlistIds);

        if (playlistData) {
            playlists.forEach(playlist => {
                const meta = playlistData.find(p => p.id === playlist.id);
                if (meta) {
                    playlist.name = meta.title;
                }
            });
        }
    }

    // Fetch track metadata from Spotify API
    if (tracks.length > 0) {
        try {
            const { getMultipleTracks } = await import('../../spotify/services/spotify_services');
            const trackIds = tracks.map(t => t.id);
            const spotifyData = await getMultipleTracks(trackIds);

            if (spotifyData?.tracks) {
                tracks.forEach(track => {
                    const spotifyTrack = spotifyData.tracks.find((t: any) => t?.id === track.id);
                    if (spotifyTrack) {
                        track.name = spotifyTrack.name;
                        track.artist = spotifyTrack.artists?.[0]?.name;
                        track.imageUrl = spotifyTrack.album?.images?.[0]?.url;
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching track metadata from Spotify:', error);
        }
    }

    // Fetch album metadata from Spotify API
    if (albums.length > 0) {
        try {
            const { getMultipleAlbums } = await import('../../spotify/services/spotify_services');
            const albumIds = albums.map(a => a.id);
            const spotifyData = await getMultipleAlbums(albumIds);

            if (spotifyData?.albums) {
                albums.forEach(album => {
                    const spotifyAlbum = spotifyData.albums.find((a: any) => a?.id === album.id);
                    if (spotifyAlbum) {
                        album.name = spotifyAlbum.name;
                        album.artist = spotifyAlbum.artists?.[0]?.name;
                        album.imageUrl = spotifyAlbum.images?.[0]?.url;
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching album metadata from Spotify:', error);
        }
    }

    return items;
}

/**
 * Get overall community statistics
 */
export async function getCommunityStats(): Promise<CommunityStats> {
    try {
        // Get total counts
        const { count: totalRatings } = await supabase
            .from('ratings')
            .select('*', { count: 'exact', head: true });

        const { count: totalComments } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true });

        const { count: totalTags } = await supabase
            .from('item_tags')
            .select('*', { count: 'exact', head: true });

        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get top rated items (across all types)
        const { data: topItems } = await supabase
            .from('item_stats')
            .select('*')
            .order('average_rating', { ascending: false })
            .limit(10);

        const topRatedItems: TrendingItem[] = (topItems || []).map(item => ({
            id: item.item_id,
            type: item.item_type as ItemType,
            name: '',
            ratingCount: item.rating_count || 0,
            avgRating: item.average_rating || 0,
            commentCount: item.comment_count || 0,
            favoriteCount: item.favorite_count || 0,
            tagCount: item.tag_count || 0,
        }));

        // Get most active users
        const { data: activeUsers } = await supabase
            .from('activity_log')
            .select('user_id, profiles(username)')
            .limit(1000);

        const userActivityMap = new Map<string, number>();
        activeUsers?.forEach(log => {
            const count = userActivityMap.get(log.user_id) || 0;
            userActivityMap.set(log.user_id, count + 1);
        });

        const mostActiveUsers = Array.from(userActivityMap.entries())
            .map(([userId, count]) => {
                const userLog = activeUsers?.find(log => log.user_id === userId);
                return {
                    userId,
                    username: (userLog?.profiles as any)?.username || 'Unknown',
                    activityCount: count,
                };
            })
            .sort((a, b) => b.activityCount - a.activityCount)
            .slice(0, 10);

        return {
            totalRatings: totalRatings || 0,
            totalComments: totalComments || 0,
            totalTags: totalTags || 0,
            totalUsers: totalUsers || 0,
            topRatedItems,
            mostActiveUsers,
        };

    } catch (error) {
        console.error('Error fetching community stats:', error);
        throw error;
    }
}

/**
 * Get trending tags (most used tags in time period)
 */
export async function getTrendingTags(timeRange: TimeRange, limit = 20): Promise<any[]> {
    const timeThreshold = getTimeThreshold(timeRange);

    let query = supabase
        .from('item_tags')
        .select('tag_id, tags(name), created_at');

    if (timeThreshold) {
        query = query.gte('created_at', timeThreshold);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching trending tags:', error);
        return [];
    }

    // Count tag occurrences
    const tagCounts = new Map<string, { name: string; count: number }>();
    data?.forEach(item => {
        const tagId = item.tag_id;
        const tagName = (item.tags as any)?.name || 'Unknown';
        const existing = tagCounts.get(tagId);
        if (existing) {
            existing.count++;
        } else {
            tagCounts.set(tagId, { name: tagName, count: 1 });
        }
    });

    return Array.from(tagCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Get recent community activity (ratings, comments, favorites)
 */
export async function getRecentActivity(limit = 10): Promise<any[]> {
    try {
        const activities: any[] = [];

        // Fetch recent ratings
        try {
            const { data: ratings } = await supabase
                .from('ratings')
                .select('id, item_id, item_type, rating, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (ratings) {
                ratings.forEach(rating => {
                    activities.push({
                        id: rating.id,
                        type: 'rating',
                        user: rating.user_id?.substring(0, 8) || 'Unknown',
                        itemId: rating.item_id,
                        itemType: rating.item_type,
                        value: rating.rating,
                        timestamp: rating.created_at,
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }

        // Fetch recent comments
        try {
            const { data: comments } = await supabase
                .from('comments')
                .select('id, item_id, item_type, content, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (comments) {
                comments.forEach(comment => {
                    activities.push({
                        id: comment.id,
                        type: 'comment',
                        user: comment.user_id?.substring(0, 8) || 'Unknown',
                        itemId: comment.item_id,
                        itemType: comment.item_type,
                        preview: comment.content?.substring(0, 50) + (comment.content?.length > 50 ? '...' : ''),
                        timestamp: comment.created_at,
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }

        // Fetch recent favorites
        try {
            const { data: favorites } = await supabase
                .from('favorites')
                .select('id, item_id, item_type, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (favorites) {
                favorites.forEach(fav => {
                    activities.push({
                        id: fav.id,
                        type: 'favorite',
                        user: fav.user_id?.substring(0, 8) || 'Unknown',
                        itemId: fav.item_id,
                        itemType: fav.item_type,
                        timestamp: fav.created_at,
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }

        // Sort all activities by timestamp and limit
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    } catch (error) {
        console.error('Error in getRecentActivity:', error);
        return [];
    }
}

/**
 * Get community quick statistics
 */
export async function getCommunityQuickStats(): Promise<{
    totalItems: number;
    activeUsers: number;
    thisWeek: number;
}> {
    try {
        // Get total items count
        const { count: totalItems } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true });

        // Get active users (users who have rated/commented in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: activeRaters } = await supabase
            .from('ratings')
            .select('user_id')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const { data: activeCommenters } = await supabase
            .from('comments')
            .select('user_id')
            .gte('created_at', thirtyDaysAgo.toISOString());

        const uniqueUsers = new Set([
            ...(activeRaters?.map(r => r.user_id) || []),
            ...(activeCommenters?.map(c => c.user_id) || [])
        ]);

        // Get items added this week
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: thisWeek } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        return {
            totalItems: totalItems || 0,
            activeUsers: uniqueUsers.size,
            thisWeek: thisWeek || 0,
        };

    } catch (error) {
        console.error('Error fetching community stats:', error);
        return {
            totalItems: 0,
            activeUsers: 0,
            thisWeek: 0,
        };
    }
}
