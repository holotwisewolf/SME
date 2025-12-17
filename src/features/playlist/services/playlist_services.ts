import { supabase } from '../../../lib/supabaseClient';
import type { Tables } from '../../../types/supabase';

// --- Caching Layer (Prevent 429 Errors) ---
const spotifyCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes cache

const getFromCache = (trackId: string) => {
    const cached = spotifyCache.get(trackId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

const setCache = (trackId: string, data: any) => {
    spotifyCache.set(trackId, { data, timestamp: Date.now() });
};
// ------------------------------------------

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
    const { data: existing } = await supabase
        .from('playlist_items')
        .select('id')
        .eq('playlist_id', request.playlistId)
        .eq('spotify_track_id', request.trackId)
        .maybeSingle();

    if (existing) {
        throw new Error('Track already in playlist');
    }

    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', request.playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextPosition = (maxPosData?.position || 0) + 1;

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
    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', request.playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextPosition = (maxPosData?.position || 0) + 1;

    const { data: existing } = await supabase
        .from('playlist_items')
        .select('spotify_track_id')
        .eq('playlist_id', request.playlistId)
        .in('spotify_track_id', request.trackIds);

    const existingIds = new Set(existing?.map(item => item.spotify_track_id) || []);
    const newTrackIds = request.trackIds.filter(id => !existingIds.has(id));

    if (newTrackIds.length === 0) return;

    const inserts = newTrackIds.map((trackId, index) => ({
        playlist_id: request.playlistId,
        spotify_track_id: trackId,
        position: nextPosition + index
    }));

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
 * [Optimized] Uses Cache and Batched Requests
 */
export async function fetchPlaylistTracksWithDetails(playlistId: string): Promise<any[]> {
    const { data: items, error } = await supabase
        .from('playlist_items')
        .select('id, spotify_track_id, added_at, position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (error) throw error;
    if (!items || items.length === 0) return [];

    const allTrackIds = items.map(item => item.spotify_track_id);
    
    // 1. Identify missing tracks
    const missingIds = allTrackIds.filter(id => !getFromCache(id));

    // 2. Fetch missing tracks
    if (missingIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < missingIds.length; i += 50) {
            chunks.push(missingIds.slice(i, i + 50));
        }

        const { getMultipleTracks } = await import('../../spotify/services/spotify_services');
        
        for (const chunk of chunks) {
            try {
                const response = await getMultipleTracks(chunk);
                if (response?.tracks) {
                    response.tracks.forEach((track: any) => {
                        if (track) setCache(track.id, track);
                    });
                }
            } catch (err) {
                console.error("Spotify API Rate Limit or Error:", err);
            }
        }
    }

    // 3. Merge details
    return items.map(item => {
        const trackDetails = getFromCache(item.spotify_track_id);
        return {
            ...item,
            details: trackDetails
        };
    });
}

/**
 * Get preview tracks for a playlist card
 * [Optimized] Uses Cache
 */
export async function getPlaylistPreviewTracks(playlistId: string, limit: number = 20): Promise<any[]> {
    const { data: items, error } = await supabase
        .from('playlist_items')
        .select('spotify_track_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true })
        .limit(limit);

    if (error) throw error;
    if (!items || items.length === 0) return [];

    const trackIds = items.map(item => item.spotify_track_id);
    
    // 1. Check Cache
    const missingIds = trackIds.filter(id => !getFromCache(id));

    // 2. Fetch missing
    if (missingIds.length > 0) {
        const { getMultipleTracks } = await import('../../spotify/services/spotify_services');
        try {
            const response = await getMultipleTracks(missingIds);
            if (response?.tracks) {
                response.tracks.forEach((track: any) => {
                    if (track) setCache(track.id, track);
                });
            }
        } catch (err) {
            console.error("Spotify API Error (Preview):", err);
        }
    }

    return trackIds.map(id => getFromCache(id)).filter(Boolean);
}

/**
 * Get tags for a playlist
 */
export async function getPlaylistTags(playlistId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('item_tags')
        .select(`tag_id, tags(name)`)
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
    return { average: sum / data.length, count: data.length };
}

/**
 * Get comments for a playlist
 */
export async function getPlaylistComments(playlistId: string): Promise<any[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles(username, display_name, avatar_url)`)
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
 * Get user's rating for a playlist
 */
export async function getUserPlaylistRating(playlistId: string): Promise<number | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    return data ? data.rating : null;
}

/**
 * Delete a playlist rating
 */
export async function deletePlaylistRating(playlistId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist')
        .eq('user_id', user.id);

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

/**
 * Upload playlist image
 */
export async function uploadPlaylistImage(playlistId: string, file: File): Promise<string> {
    const fileName = `${playlistId}`; 
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
        .from('playlists')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
        .from('playlists')
        .getPublicUrl(filePath);
    return publicUrl;
}

/**
 * Add a tag to a playlist
 */
export async function addPlaylistTag(playlistId: string, tag: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let tagId: string;
    const { data: existingTag } = await supabase.from('tags').select('id').eq('name', tag).maybeSingle();

    if (existingTag) {
        tagId = existingTag.id;
    } else {
        const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ name: tag, type: 'custom', creator_id: user.id })
            .select('id')
            .single();

        if (createError) throw createError;
        tagId = newTag.id;
    }

    const { error } = await supabase.from('item_tags').insert({
        item_id: playlistId,
        item_type: 'playlist',
        tag_id: tagId,
        user_id: user.id
    });

    if (error && error.code !== '23505') throw error;
}

/**
 * Remove a tag from a playlist
 */
export async function removePlaylistTag(playlistId: string, tag: string): Promise<void> {
    const { data: tagData } = await supabase.from('tags').select('id').eq('name', tag).maybeSingle();
    if (!tagData) return;

    const { error } = await supabase
        .from('item_tags')
        .delete()
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist')
        .eq('tag_id', tagData.id);

    if (error) throw error;
}

/**
 * Update playlist title
 */
export async function updatePlaylistTitle(playlistId: string, newTitle: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ title: newTitle }).eq('id', playlistId);
    if (error) throw error;
}

/**
 * Update playlist description
 */
export async function updatePlaylistDescription(playlistId: string, newDescription: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ description: newDescription }).eq('id', playlistId);
    if (error) throw error;
}

/**
 * Update playlist rating
 */
export async function updatePlaylistRating(playlistId: string, rating: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

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
 * Update playlist public status
 */
export async function updatePlaylistPublicStatus(playlistId: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase.from('playlists').update({ is_public: isPublic }).eq('id', playlistId);
    if (error) throw error;
}

/**
 * Update playlist color
 */
export async function updatePlaylistColor(playlistId: string, color: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ color: color }).eq('id', playlistId);
    if (error) throw error;
}

/**
 * Remove track from playlist
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
 * Get all available tags (preseeded/system tags)
 */
export async function getAllTags(): Promise<string[]> {
    const { data, error } = await supabase.from('tags').select('name').order('name');
    if (error) throw error;
    return Array.from(new Set(data.map(t => t.name)));
}