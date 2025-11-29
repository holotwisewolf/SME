import { supabase } from '../../../lib/supabaseClient';
import type { Playlist, CreatePlaylistRequest, AddTrackToPlaylistRequest } from '../contracts/playlist_contract';

/**
 * Get all playlists for the current user
 */
export async function getUserPlaylists(): Promise<Playlist[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        name: item.title,
        description: item.description || undefined,
        image_url: undefined, // 'color' is available, but not image_url in DB yet
        track_count: item.track_count || 0,
        is_public: item.is_public || false,
        owner_id: item.user_id,
        created_at: item.created_at
    }));
}

/**
 * Create a new playlist
 */
export async function createPlaylist(request: CreatePlaylistRequest): Promise<Playlist> {
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

    return {
        id: data.id,
        name: data.title,
        description: data.description || undefined,
        track_count: data.track_count || 0,
        is_public: data.is_public || false,
        owner_id: data.user_id,
        created_at: data.created_at
    };
}

/**
 * Add a track to a playlist
 */
export async function addTrackToPlaylist(request: AddTrackToPlaylistRequest): Promise<void> {
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
 * Add a track to favourites (Wrapper for FavouritesService)
 */
export async function addToFavourites(trackId: string): Promise<void> {
    const { addToFavourites: addToFavs } = await import('../../favourites/services/favourites_services');
    return addToFavs(trackId);
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