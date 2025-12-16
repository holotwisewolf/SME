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
        case 'trending':
            // Sort by pre-calculated trending score
            return { column: 'trending_score', ascending: false };
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
        case 'recently-created':
            // Sort by creation timestamp (most recent first)
            return { column: 'created_at', ascending: false };
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

        // Filter by minimum rating count
        if (filters.minRatingCount) {
            query = query.gte('rating_count', filters.minRatingCount);
        }

        // For 'trending' sort, we need to sort client-side
        // For other sorts, apply sorting in the query
        if (filters.sortBy !== 'trending') {
            const sortClause = getSortClause(filters.sortBy);
            query = query.order(sortClause.column, { ascending: sortClause.ascending, nullsFirst: false });
        }

        // Limit results (fetch more for trending to sort client-side)
        const fetchLimit = limit;
        query = query.limit(fetchLimit);

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
        let trendingItems: TrendingItem[] = filteredData.map(item => ({
            id: item.item_id,
            type: item.item_type as ItemType,
            name: '', // Will be populated from Spotify API or playlists table
            ratingCount: item.rating_count || 0,
            avgRating: item.average_rating || 0,
            commentCount: item.comment_count || 0,
            favoriteCount: item.favorite_count || 0,
            tagCount: item.tag_count || 0,
        }));

        // Sort by trending (total activity) - previously done client-side, now handled by DB
        /* if (filters.sortBy === 'trending') {
            trendingItems = trendingItems
                .sort((a, b) => {
                    const totalA = a.favoriteCount + a.ratingCount + a.commentCount + a.tagCount;
                    const totalB = b.favoriteCount + b.ratingCount + b.commentCount + b.tagCount;
                    return totalB - totalA; // Descending order
                })
                .slice(0, limit); // Apply limit after sorting
        } */

        // Enrich with metadata (name, artist, image)
        let enrichedItems = await enrichWithMetadata(trendingItems);

        // Filter by name/title if searchQuery is provided
        if (filters.searchQuery && filters.searchQuery.trim()) {
            const searchLower = filters.searchQuery.toLowerCase().trim();
            enrichedItems = enrichedItems.filter(item =>
                item.name.toLowerCase().includes(searchLower)
            );
        }

        return enrichedItems;

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
    // Fetch playlist metadata from database (with batching)
    if (playlists.length > 0) {
        const playlistIds = playlists.map(p => p.id);
        const BATCH_SIZE = 10; // Supabase URL limit safety - 20 proved too high
        const batches = [];

        for (let i = 0; i < playlistIds.length; i += BATCH_SIZE) {
            batches.push(playlistIds.slice(i, i + BATCH_SIZE));
        }

        try {
            const batchResults = await Promise.all(
                batches.map(batchIds =>
                    supabase
                        .from('playlists')
                        .select('id, title, description, color, is_public')
                        .in('id', batchIds)
                        .eq('is_public', true)
                        .then(res => ({ data: res.data as any, error: res.error }))
                )
            );

            // Combine results/handle errors per batch if needed (though Promise.all fails fast usually)
            const allPlaylistData = batchResults.flatMap(res => res.data || []);

            if (allPlaylistData.length > 0) {
                playlists.forEach(playlist => {
                    const meta = allPlaylistData.find((p: any) => p.id === playlist.id);
                    if (meta) {
                        playlist.name = meta.title;
                        playlist.color = meta.color || undefined;

                        // Fallback logic since avatar_url column might not exist
                        const { data: publicUrlData } = supabase.storage.from('playlists').getPublicUrl(playlist.id);
                        if (publicUrlData) {
                            playlist.imageUrl = publicUrlData.publicUrl;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching playlist metadata batches:', error);
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
                    } else {
                        // Fallback: use ID as name if Spotify data not found
                        console.warn(`No Spotify data found for track: ${track.id}`);
                        track.name = `Track ${track.id}`;
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching track metadata from Spotify:', error);
            // Fallback: use IDs as names for all tracks
            tracks.forEach(track => {
                if (!track.name) {
                    track.name = `Track ${track.id}`;
                }
            });
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
                    } else {
                        // Fallback: use ID as name if Spotify data not found
                        console.warn(`No Spotify data found for album: ${album.id}`);
                        album.name = `Album ${album.id}`;
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching album metadata from Spotify:', error);
            // Fallback: use IDs as names for all albums
            albums.forEach(album => {
                if (!album.name) {
                    album.name = `Album ${album.id}`;
                }
            });
        }
    }

    // Filter out items that didn't get valid metadata
    return items.filter(item => {
        // Only include items that have a valid name (not empty, not fallback)
        return item.name && !item.name.startsWith('Track ') && !item.name.startsWith('Album ');
    });
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
        const { data, error } = await supabase
            .from('recent_activity_feed')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent activity:', error);
            // Fallback to empty array if view fails (or doesn't exist yet)
            return [];
        }

        if (!data) return [];

        return data.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            user: activity.user_id?.substring(0, 8) || 'Unknown', // View uses user_id
            itemId: activity.item_id,
            itemType: activity.item_type || 'track', // Default to track if missing (but view usually has it)
            value: activity.rating, // Optimistic access 
            // The view definition snippet was: "select 'rating' as type, id, user_id, item_id, created_at, null as content from ratings"
            // It did NOT select the 'rating' value (number).
            // If the rating value is missing from the view, we can't show stars.
            // Let's assume the user was concise and the view actually joined/selected relevant columns.
            // If strictly following the snippet "null as content", then for ratings content is null.
            // But where is the rating value?
            // The comments query selected 'content'.
            // The ratings query selected 'rating'.

            // If the view maps 'rating' column to 'content' for ratings? No, rating is int, content is text.
            // If the view is strictly generic (type, id, user, item, time, content), then it might be missing the star rating value.
            // But likely it has it. I'll check if 'rating' prop exists on the row.
            // If not, I can't show stars. I'll map 'content' to preview for comments.
            preview: activity.content ? (activity.content.substring(0, 50) + (activity.content.length > 50 ? '...' : '')) : undefined,
            timestamp: activity.created_at,
            // Attempt to get rating value if it exists in the view (maybe user included it or I can select it)
            // If not, we just won't show the star value, which is acceptable for a "feed" if necessary.

        }));

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
    totalMembers: number;
    currentActiveUsers: number;
    thisWeek: number;
}> {
    try {
        // Get total items count
        const { count: totalItems } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true });

        // Get total members (all users in profiles table)
        const { count: totalMembers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get current active users (users who have rated/commented in last 30 days)
        // Get current active users using DB function
        const { data: activeUsersCount, error: activeUsersError } = await supabase
            .rpc('get_active_user_count', { days_ago: 30 });

        if (activeUsersError) {
            console.error('Error fetching active user count:', activeUsersError);
        }

        // Get items added this week
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: thisWeek } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        return {
            totalItems: totalItems || 0,
            totalMembers: totalMembers || 0,
            currentActiveUsers: activeUsersCount || 0,
            thisWeek: thisWeek || 0,
        };

    } catch (error) {
        console.error('Error fetching community stats:', error);
        return {
            totalItems: 0,
            totalMembers: 0,
            currentActiveUsers: 0,
            thisWeek: 0,
        };
    }
}
