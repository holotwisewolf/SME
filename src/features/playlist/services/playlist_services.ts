import { supabase } from '../../../lib/supabaseClient';
import type { Tables } from '../../../types/supabase';

/**
 * Get all playlists for the current user
 */
export async function getUserPlaylists(): Promise<Tables<'playlists'>[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}

/**
 * Create a new playlist
 */
export interface CreatePlaylistRequest {
    name: string;
    description?: string;
    is_public: boolean;
}

/**
 * Create a new playlist
 */
export async function createPlaylist(request: CreatePlaylistRequest): Promise<Tables<'playlists'>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('playlists')
        .insert({
            title: request.name,
            description: request.description,
            is_public: request.is_public,
            user_id: user.id,
            track_count: 0
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

/**
 * Add a track to a playlist
 */
export async function addTrackToPlaylist(request: { playlistId: string; trackId: string }): Promise<void> {
    // 1. Check if track already exists in playlist
    const { data: existing } = await supabase
        .from('playlist_items')
        .select('id')
        .eq('playlist_id', request.playlistId)
        .eq('spotify_track_id', request.trackId)
        .single();

    if (existing) {
        console.log('Track already in playlist');
        return;
    }

    // 2. Get current max position
    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', request.playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

    const nextPosition = (maxPosData?.position || 0) + 1;

    // 3. Add track
    const { error } = await supabase
        .from('playlist_items')
        .insert({
            playlist_id: request.playlistId,
            spotify_track_id: request.trackId,
            position: nextPosition
        });

    if (error) throw error;
}

/**
 * Add multiple tracks to a playlist
 */

export async function addTracksToPlaylist(request: { playlistId: string; trackIds: string[] }): Promise<void> {
    // 1. Get current max position
    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', request.playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

    const nextPosition = (maxPosData?.position || 0) + 1;

    // 2. Filter out existing tracks to avoid duplicates
    const { data: existing } = await supabase
        .from('playlist_items')
        .select('spotify_track_id')
        .eq('playlist_id', request.playlistId)
        .in('spotify_track_id', request.trackIds);

    const existingIds = new Set(existing?.map(item => item.spotify_track_id) || []);
    const newTrackIds = request.trackIds.filter(id => !existingIds.has(id));

    if (newTrackIds.length === 0) return;

    // 3. Prepare inserts
    const inserts = newTrackIds.map((trackId, index) => ({
        playlist_id: request.playlistId,
        spotify_track_id: trackId,
        position: nextPosition + index
    }));

    // 4. Bulk insert
    const { error } = await supabase
        .from('playlist_items')
        .insert(inserts);

    if (error) throw error;
}

/**
 * Get tracks for a playlist
 */
export async function getPlaylistTracks(playlistId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('playlist_items')
        .select('spotify_track_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (error) throw error;
    return data.map(item => item.spotify_track_id);
}

/**
 * Add an item to favourites (Wrapper for FavouritesService)
 */
export async function addToFavourites(itemId: string, type: 'track' | 'album' = 'track'): Promise<void> {
    const { addToFavourites: addToFavs } = await import('../../favourites/services/favourites_services');
    return addToFavs(itemId, type);
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(playlistId: string): Promise<void> {
    const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

    if (error) throw error;
}

/**
 * Get full track details for a playlist
 */
export async function fetchPlaylistTracksWithDetails(playlistId: string): Promise<any[]> {
    // 1. Get track IDs from playlist_items
    const { data: items, error } = await supabase
        .from('playlist_items')
        .select('id, spotify_track_id, added_at, position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (error) throw error;
    if (!items || items.length === 0) return [];

    // 2. Fetch track details from Spotify
    const trackIds = items.map(item => item.spotify_track_id);
    // Batch requests in chunks of 50 (Spotify limit)
    const chunks = [];
    for (let i = 0; i < trackIds.length; i += 50) {
        chunks.push(trackIds.slice(i, i + 50));
    }

    const { getMultipleTracks } = await import('../../spotify/services/spotify_services');
    let allTracks: any[] = [];

    for (const chunk of chunks) {
        const response = await getMultipleTracks(chunk);
        if (response?.tracks) {
            allTracks = [...allTracks, ...response.tracks];
        }
    }

    // 3. Merge details
    return items.map(item => {
        const trackDetails = allTracks.find(t => t.id === item.spotify_track_id);
        return {
            ...item,
            details: trackDetails
        };
    });
}

/**
 * Get tags for a playlist
 */
export async function getPlaylistTags(playlistId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('item_tags')
        .select(`
tag_id,
    tags(
        name
    )
        `)
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist');

    if (error) throw error;
    return data.map((item: any) => item.tags?.name).filter(Boolean);
}

/**
 * Get average rating for a playlist
 */
export async function getPlaylistRating(playlistId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist');

    if (error) throw error;

    if (!data || data.length === 0) return { average: 0, count: 0 };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
        average: sum / data.length,
        count: data.length
    };
}

/**
 * Get comments for a playlist
 */
export async function getPlaylistComments(playlistId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
    *,
    profiles(
        username,
        avatar_url
    )
        `)
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Add a comment to a playlist
 */
export async function addPlaylistComment(playlistId: string, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('comments')
        .insert({
            item_id: playlistId,
            item_type: 'playlist',
            user_id: user.id,
            content: content
        });

    if (error) throw error;
}

/**
 * Update playlist title
 */
export async function updatePlaylistTitle(playlistId: string, newTitle: string): Promise<void> {
    const { error } = await supabase
        .from('playlists')
        .update({ title: newTitle })
        .eq('id', playlistId);

    if (error) throw error;
}

/**
 * Update playlist public status
 */
export async function updatePlaylistPublicStatus(playlistId: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase
        .from('playlists')
        .update({ is_public: isPublic })
        .eq('id', playlistId);

    if (error) throw error;
}

/**
 * Remove a track from a playlist
 */
export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const { error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('spotify_track_id', trackId);

    if (error) throw error;
}

/**
 * Update playlist rating
 */
export async function updatePlaylistRating(playlistId: string, rating: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upsert rating
    const { error } = await supabase
        .from('ratings')
        .upsert({
            item_id: playlistId,
            item_type: 'playlist',
            user_id: user.id,
            rating: rating
        }, { onConflict: 'item_id, item_type, user_id' });

    if (error) throw error;
}

/**
 * Reorder playlist tracks
 */
export async function reorderPlaylistTracks(tracks: { id: string; position: number }[]): Promise<void> {
    const updates = tracks.map(track =>
        supabase
            .from('playlist_items')
            .update({ position: track.position })
            .eq('id', track.id)
    );

    await Promise.all(updates);
}
