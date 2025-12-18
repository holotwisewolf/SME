// Trending services - fetch and filter trending content

import { supabase } from '../../../lib/supabaseClient';
import type { TrendingFilters, TrendingItem, CommunityStats, TimeRange, SortBy } from '../types/trending';
import type { ItemType } from '../../../types/global';
import { getMultipleTracks, getMultipleAlbums } from '../../spotify/services/spotify_services';

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
            // Sort by sum of all activity counts
            return { column: '(favorite_count + rating_count + comment_count + tag_count)', ascending: false };
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
        const fetchLimit = filters.sortBy === 'trending' ? limit * 2 : limit;
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

        // Sort by trending (total activity) if needed
        if (filters.sortBy === 'trending') {
            trendingItems = trendingItems
                .sort((a, b) => {
                    const totalA = a.favoriteCount + a.ratingCount + a.commentCount + a.tagCount;
                    const totalB = b.favoriteCount + b.ratingCount + b.commentCount + b.tagCount;
                    return totalB - totalA; // Descending order
                })
                .slice(0, limit); // Apply limit after sorting
        }

        // Sort by top-rated with secondary sort by rating count
        // e.g., 5.0 stars with 3 ratings ranks higher than 5.0 stars with 1 rating
        if (filters.sortBy === 'top-rated') {
            trendingItems = trendingItems.sort((a, b) => {
                // Primary: higher average rating wins
                if (b.avgRating !== a.avgRating) {
                    return b.avgRating - a.avgRating;
                }
                // Secondary: more ratings wins (tie-breaker)
                return b.ratingCount - a.ratingCount;
            });
        }

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
    if (playlists.length > 0) {
        const playlistIds = playlists.map(p => p.id);
        const { data: playlistData } = await supabase
            .from('playlists')
            .select('id, title, description, color, is_public')
            .in('id', playlistIds)
            .eq('is_public', true); // Only fetch public playlists

        if (playlistData) {
            // Check which playlists have images in storage
            const imageChecks = await Promise.all(
                playlistData.map(async (meta) => {
                    const { data, error } = await supabase.storage
                        .from('playlists')
                        .list('', { search: meta.id });

                    const hasImage = data && data.length > 0 && !error;
                    return { id: meta.id, hasImage };
                })
            );

            const imageMap = new Map(imageChecks.map(check => [check.id, check.hasImage]));

            playlists.forEach(playlist => {
                const meta = playlistData.find(p => p.id === playlist.id);
                if (meta) {
                    playlist.name = meta.title;
                    playlist.color = meta.color || undefined;

                    // Only set imageUrl if image actually exists in storage
                    if (imageMap.get(meta.id)) {
                        playlist.imageUrl = supabase.storage.from('playlists').getPublicUrl(playlist.id).data.publicUrl;
                    }
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
    // This also filters private playlists since they won't have metadata from the .eq('is_public', true) query
    return items.filter(item => {
        // Only include items that have a valid name (not empty, not fallback)
        if (!item.name) return false;
        if (item.name.startsWith('Track ')) return false;
        if (item.name.startsWith('Album ')) return false;
        if (item.type === 'playlist' && item.name.startsWith('Playlist ')) return false;
        return true;
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
export async function getRecentActivity(limit = 10, page = 1): Promise<any[]> {
    try {
        const offset = (page - 1) * limit;

        // Use the recent_activity_feed view (pre-merged activity stream)
        const { data: activities, error } = await supabase
            .from('recent_activity_feed')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching recent activity from view:', error);
            return [];
        }

        if (!activities || activities.length === 0) return [];

        // 2. ENRICHMENT
        const uniqueUserIds = [...new Set(activities.map(item => item.user_id).filter(Boolean))] as string[];
        let profiles: any[] = [];
        if (uniqueUserIds.length > 0) {
            const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', uniqueUserIds);
            profiles = data || [];
        }

        const trackIds = activities.filter(a => a.item_type?.toLowerCase() === 'track').map(a => a.item_id).filter(Boolean) as string[];
        const albumIds = activities.filter(a => a.item_type?.toLowerCase() === 'album').map(a => a.item_id).filter(Boolean) as string[];
        const playlistIds = activities.filter(a => a.item_type?.toLowerCase() === 'playlist').map(a => a.item_id).filter(Boolean) as string[];

        // Helper to detect if it's a Spotify ID (usually 22 chars) vs Supabase UUID
        const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        const internalPlaylistIds = playlistIds.filter(id => isUUID(id));

        let spotifyTracks: any[] = [];
        let spotifyAlbums: any[] = [];
        let internalPlaylists: any[] = [];

        // Fetch Metadata in Parallel
        const [trackData, albumData, internalPLData] = await Promise.all([
            trackIds.length > 0 ? getMultipleTracks(trackIds) : Promise.resolve(null),
            albumIds.length > 0 ? getMultipleAlbums(albumIds) : Promise.resolve(null),
            internalPlaylistIds.length > 0 ? supabase.from('playlists').select('id, title, user_id, profiles:user_id(display_name)').in('id', internalPlaylistIds) : Promise.resolve({ data: [] })
        ]);


        if (trackData?.tracks) spotifyTracks = trackData.tracks;
        if (albumData?.albums) spotifyAlbums = albumData.albums;
        if (internalPLData?.data) internalPlaylists = internalPLData.data;

        // 3. Map Final Data
        return activities.map(item => {
            const userProfile = profiles.find(p => p.id === item.user_id);
            const displayName = userProfile?.display_name || userProfile?.username || 'Anonymous';
            const type = item.item_type?.toLowerCase();

            let mediaTitle = 'Unknown Title';
            let mediaArtist = 'Unknown Artist';

            if (type === 'track') {
                const t = spotifyTracks.find(track => track && track.id === item.item_id);
                mediaTitle = t ? t.name : 'Track';
                mediaArtist = t ? t.artists[0]?.name : 'Spotify';
            }
            else if (type === 'album') {
                const a = spotifyAlbums.find(album => album && album.id === item.item_id);
                mediaTitle = a ? a.name : 'Album';
                mediaArtist = a ? a.artists[0]?.name : 'Spotify';
            }
            else if (type === 'playlist') {
                const p = internalPlaylists.find(pl => pl.id === item.item_id);
                if (p) {
                    mediaTitle = p.title || p.name || 'Untitled Playlist';
                    const creator = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                    mediaArtist = creator?.display_name || 'Community Member';
                } else if (item.item_id && !isUUID(item.item_id)) {
                    // It's a Spotify Playlist ID
                    mediaTitle = 'Spotify Playlist';
                    mediaArtist = 'Spotify';
                } else {
                    mediaTitle = 'Deleted Playlist';
                    mediaArtist = 'Hidden';
                }
            }

            return {
                id: item.id,
                type: item.type,
                created_at: item.created_at,
                content: item.content,
                itemType: type,
                user: { id: item.user_id, display_name: displayName, avatar_url: userProfile?.avatar_url },
                track: { id: item.item_id, title: mediaTitle, artist: mediaArtist }
            };
        });
    } catch (error) {
        console.error('Error in getRecentActivity:', error);
        return [];
    }
}

/**
 * Get community quick statistics
 * * ENHANCED: Now includes favorites and tagging as active behavior
 */
export async function getCommunityQuickStats(): Promise<{
    totalItems: number;
    totalMembers: number;
    currentActiveUsers: number;
    thisWeek: number;
}> {
    try {
        // 1. Get basic counts
        const { count: totalItems } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true });

        const { count: totalMembers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // 2. Define 30-day threshold
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const threshold = thirtyDaysAgo.toISOString();

        // 3. Fetch user IDs from ALL interactive tables to determine activity
        const [ratings, comments, favorites, tags] = await Promise.all([
            supabase.from('ratings').select('user_id').gte('created_at', threshold),
            supabase.from('comments').select('user_id').gte('created_at', threshold),
            supabase.from('favorites').select('user_id').gte('created_at', threshold),
            supabase.from('item_tags').select('user_id').gte('created_at', threshold)
        ]);

        // 4. Combine into a Set to get unique active users
        const activeUsersSet = new Set([
            ...(ratings.data?.map(r => r.user_id) || []),
            ...(comments.data?.map(c => c.user_id) || []),
            ...(favorites.data?.map(f => f.user_id) || []),
            ...(tags.data?.map(t => t.user_id) || [])
        ]);

        // 5. Get new items added this week
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: thisWeek } = await supabase
            .from('item_stats')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        return {
            totalItems: totalItems || 0,
            totalMembers: totalMembers || 0,
            currentActiveUsers: activeUsersSet.size, // This will now be more accurate
            thisWeek: thisWeek || 0,
        };

    } catch (error) {
        console.error('Error fetching community stats:', error);
        return { totalItems: 0, totalMembers: 0, currentActiveUsers: 0, thisWeek: 0 };
    }
}
