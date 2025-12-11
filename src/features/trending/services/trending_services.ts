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
    // Separate playlists from tracks/albums
    const playlists = items.filter(item => item.type === 'playlist');

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

    // For tracks/albums, we would fetch from Spotify API
    // This would require the spotify_services integration
    // For now, we'll leave them with empty names and handle in the component

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
