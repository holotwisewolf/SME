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
export async function createPlaylist(request: { name: string; description?: string; is_public: boolean }): Promise<Tables<'playlists'>> {
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