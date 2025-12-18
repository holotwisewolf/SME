import { supabase } from '../../../lib/supabaseClient';
import type { Tables } from '../../../types/supabase';

// --- Types Needed for Dashboard ---
export interface EnhancedPlaylist extends Tables<'playlists'> {
    // Global Stats
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    tag_count?: number;
    tags?: string[];

    // Global Timestamps
    commented_at?: string;
    rated_at?: string;
    tagged_at?: string;

    // Personal Stats
    user_rating?: number;
    user_rated_at?: string;
    user_tags?: string[];
    user_tag_count?: number;
    user_tagged_at?: string;
}

// --- Helper ---
export const getLatestTime = (item: { created_at: string; updated_at?: string | null }) => {
    const created = new Date(item.created_at).getTime();
    const updated = item.updated_at ? new Date(item.updated_at).getTime() : 0;
    return updated > created ? item.updated_at! : item.created_at;
};

// ==========================================
// NEW Aggregation Functions (Required for Dashboard)
// ==========================================

export async function getEnhancedPlaylists(userId: string): Promise<{ playlists: EnhancedPlaylist[], favoriteIds: Set<string> }> {
    // 1. First get user's favourited playlist IDs
    const { data: favoritesRes, error: favError } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'playlist');

    if (favError) throw favError;
    const favoriteIds = new Set((favoritesRes || []).map(f => f.item_id));
    const favoritedPlaylistIds = Array.from(favoriteIds);

    // 2. Fetch owned playlists from view
    const { data: ownedPlaylists, error: ownedError } = await supabase
        .from('enhanced_playlists_master')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // 3. Fetch favourited playlists (from other users) if any exist
    let favouritedPlaylists: typeof ownedPlaylists = [];
    if (favoritedPlaylistIds.length > 0) {
        const { data: favPlaylists, error: favPlaylistsError } = await supabase
            .from('enhanced_playlists_master')
            .select('*')
            .in('id', favoritedPlaylistIds)
            .neq('user_id', userId) // Exclude already-fetched owned playlists
            .order('created_at', { ascending: false });

        if (favPlaylistsError) throw favPlaylistsError;
        favouritedPlaylists = favPlaylists || [];
    }

    // 4. Combine both lists
    const basePlaylists = [...(ownedPlaylists || []), ...favouritedPlaylists];

    if (basePlaylists.length === 0) return { playlists: [], favoriteIds };

    const playlistIds = basePlaylists.map(p => p.id).filter(Boolean) as string[];

    // Fetch user-specific data (user ratings, user tags) - view doesn't include these
    const [userRatingsRes, userTagsRes] = await Promise.all([
        supabase.from('ratings').select('item_id, rating, created_at, updated_at').eq('item_type', 'playlist').eq('user_id', userId).in('item_id', playlistIds),
        supabase.from('item_tags').select('item_id, created_at, tags(name)').eq('item_type', 'playlist').eq('user_id', userId).in('item_id', playlistIds),
    ]);

    const playlists: EnhancedPlaylist[] = basePlaylists.map(p => {
        const userRating = userRatingsRes.data?.find(r => r.item_id === p.id);
        const userTags = userTagsRes.data?.filter(t => t.item_id === p.id) || [];
        // @ts-ignore
        const userTagNames = Array.from(new Set(userTags.map(t => t.tags?.name).filter(Boolean)));

        return {
            // Base playlist data (from view) - provide defaults for nullable fields
            id: p.id!,
            title: p.title ?? 'Untitled Playlist',
            description: p.description,
            color: p.color,
            is_public: p.is_public ?? false,
            playlistimg_url: p.playlistimg_url,
            spotify_playlist_id: p.spotify_playlist_id,
            user_id: p.user_id ?? '',
            created_at: p.created_at ?? new Date().toISOString(),
            updated_at: p.updated_at ?? new Date().toISOString(),
            track_count: p.track_count,
            // Pre-calculated stats from view
            rating_avg: p.rating_avg ?? 0,
            rating_count: p.rating_count ?? 0,
            comment_count: p.comment_count ?? 0,
            tag_count: p.tag_count ?? 0,
            // User-specific data
            user_rating: userRating?.rating ?? 0,
            user_rated_at: userRating ? getLatestTime(userRating) : undefined,
            user_tags: userTagNames as string[],
            user_tag_count: userTags.length,
            user_tagged_at: userTags.length > 0 ? userTags.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, userTags[0].created_at) : undefined
        };
    });

    return { playlists, favoriteIds };
}

export async function getPlaylistStats(playlistId: string, userId: string): Promise<Partial<EnhancedPlaylist>> {
    // Fetch pre-calculated stats from view
    const { data: viewData, error: viewError } = await supabase
        .from('enhanced_playlists_master')
        .select('rating_avg, rating_count, comment_count, tag_count')
        .eq('id', playlistId)
        .single();

    if (viewError && viewError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching playlist stats from view:', viewError);
    }

    // Fetch user-specific data
    const [userRatingRes, userTagsRes] = await Promise.all([
        supabase.from('ratings').select('rating, created_at, updated_at').eq('item_type', 'playlist').eq('item_id', playlistId).eq('user_id', userId).single(),
        supabase.from('item_tags').select('created_at, tags(name)').eq('item_type', 'playlist').eq('item_id', playlistId).eq('user_id', userId),
    ]);

    // @ts-ignore
    const userTagNames = Array.from(new Set((userTagsRes.data || []).map(t => t.tags?.name).filter(Boolean)));
    const userTags = userTagsRes.data || [];
    const userTaggedAt = userTags.length > 0 ? userTags.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, userTags[0].created_at) : undefined;

    return {
        rating_avg: viewData?.rating_avg ?? 0,
        rating_count: viewData?.rating_count ?? 0,
        comment_count: viewData?.comment_count ?? 0,
        tag_count: viewData?.tag_count ?? 0,
        user_rating: userRatingRes.data?.rating ?? 0,
        user_rated_at: userRatingRes.data ? getLatestTime(userRatingRes.data) : undefined,
        user_tags: userTagNames as string[],
        user_tag_count: userTags.length,
        user_tagged_at: userTaggedAt
    };
}


// ==========================================
// Existing CRUD Operations (Original)
// ==========================================

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

export async function getPlaylistTracks(playlistId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('playlist_items')
        .select('spotify_track_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (error) throw error;
    return data.map(item => item.spotify_track_id);
}

export async function deletePlaylist(playlistId: string): Promise<void> {
    const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

    if (error) throw error;
}

export async function fetchPlaylistTracksWithDetails(playlistId: string): Promise<any[]> {
    const { data: items, error } = await supabase
        .from('playlist_items')
        .select('id, spotify_track_id, added_at, position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (error) throw error;
    if (!items || items.length === 0) return [];

    const allTrackIds = items.map(item => item.spotify_track_id);
    const trackDetailsMap = new Map<string, any>();

    // Fetch all tracks (batched)
    const chunks = [];
    for (let i = 0; i < allTrackIds.length; i += 50) {
        chunks.push(allTrackIds.slice(i, i + 50));
    }

    const { getMultipleTracks } = await import('../../spotify/services/spotify_services');

    for (const chunk of chunks) {
        try {
            const response = await getMultipleTracks(chunk);
            if (response?.tracks) {
                response.tracks.forEach((track: any) => {
                    if (track) trackDetailsMap.set(track.id, track);
                });
            }
        } catch (err) {
            console.error("Spotify API Rate Limit or Error:", err);
        }
    }

    // Merge details
    return items.map(item => ({
        ...item,
        details: trackDetailsMap.get(item.spotify_track_id)
    }));
}

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

    const { getMultipleTracks } = await import('../../spotify/services/spotify_services');
    try {
        const response = await getMultipleTracks(trackIds);
        if (response?.tracks) {
            return response.tracks.filter(Boolean);
        }
    } catch (err) {
        console.error("Spotify API Error (Preview):", err);
    }

    return [];
}

export async function getPlaylistTags(playlistId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('item_tags')
        .select(`tag_id, tags(name)`)
        .eq('item_id', playlistId)
        .eq('item_type', 'playlist');

    if (error) throw error;
    return data.map((item: any) => item.tags?.name).filter(Boolean);
}

export async function getPlaylistRating(playlistId: string): Promise<{ average: number; count: number }> {
    // Use the enhanced_playlists_master view for pre-calculated rating data
    const { data, error } = await supabase
        .from('enhanced_playlists_master')
        .select('rating_avg, rating_count')
        .eq('id', playlistId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching playlist rating from view:', error);
    }

    return { average: data?.rating_avg ?? 0, count: data?.rating_count ?? 0 };
}

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

export async function reorderPlaylistTracks(tracks: { id: string; position: number }[]): Promise<void> {
    const updates = tracks.map(track =>
        supabase
            .from('playlist_items')
            .update({ position: track.position })
            .eq('id', track.id)
    );
    await Promise.all(updates);
}

// services/playlist_services.ts

export async function uploadPlaylistImage(playlistId: string, file: File): Promise<string> {
    // 1. Authenticate user to ensure security and proper file path naming
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Define the file path within the bucket: userID/playlistID
    // This structure prevents filename collisions between users
    const filePath = `${user.id}/${playlistId}`;

    // 2. Upload the image file to Supabase Storage (Bucket: 'playlistimg')
    // 'upsert: true' allows overwriting the existing file if one exists
    const { error: uploadError } = await supabase.storage
        .from('playlistimg')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error("Storage Upload Error:", uploadError.message);
        throw uploadError;
    }

    // 3. Retrieve the public URL for the uploaded file
    // Note: The bucket must be set to 'public' in Supabase policies for this to work
    const { data: { publicUrl } } = supabase.storage
        .from('playlistimg')
        .getPublicUrl(filePath);

    // 4. Update the playlist record in the database with the new image URL
    const { error: dbError } = await supabase
        .from('playlists')
        .update({ playlistimg_url: publicUrl })
        .eq('id', playlistId);

    if (dbError) {
        console.error("Database Update Error:", dbError.message);
        // Optional: You might want to delete the uploaded file here to maintain consistency if the DB update fails
        throw dbError;
    }

    return publicUrl;
}

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

export async function updatePlaylistTitle(playlistId: string, newTitle: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ title: newTitle }).eq('id', playlistId);
    if (error) throw error;
}

export async function updatePlaylistDescription(playlistId: string, newDescription: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ description: newDescription }).eq('id', playlistId);
    if (error) throw error;
}

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

export async function updatePlaylistPublicStatus(playlistId: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase.from('playlists').update({ is_public: isPublic }).eq('id', playlistId);
    if (error) throw error;
}

export async function updatePlaylistColor(playlistId: string, color: string): Promise<void> {
    const { error } = await supabase.from('playlists').update({ color: color }).eq('id', playlistId);
    if (error) throw error;
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const { error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('spotify_track_id', trackId);

    if (error) throw error;
}

export async function getAllTags(): Promise<string[]> {
    const { data, error } = await supabase.from('tags').select('name').order('name');
    if (error) throw error;
    return Array.from(new Set(data.map(t => t.name)));
}

/**
 * Copy a playlist to the current user's library
 * Creates a new playlist with the same title + " (Copy)" and duplicates all tracks
 */
export async function copyPlaylist(sourcePlaylistId: string): Promise<Tables<'playlists'>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Get source playlist details
    const { data: sourcePlaylist, error: sourceError } = await supabase
        .from('playlists')
        .select('title, description, color, is_public')
        .eq('id', sourcePlaylistId)
        .single();

    if (sourceError) throw sourceError;

    // 2. Get all tracks from source playlist
    const { data: sourceTracks, error: tracksError } = await supabase
        .from('playlist_items')
        .select('spotify_track_id, spotify_album_id, position')
        .eq('playlist_id', sourcePlaylistId)
        .order('position');

    if (tracksError) throw tracksError;

    // 3. Create new playlist with "(Copy)" suffix
    const { data: newPlaylist, error: createError } = await supabase
        .from('playlists')
        .insert({
            title: `${sourcePlaylist.title} (Copy)`,
            description: sourcePlaylist.description,
            color: sourcePlaylist.color,
            is_public: false, // Default copied playlists to private
            user_id: user.id,
            track_count: sourceTracks?.length || 0
        })
        .select()
        .single();

    if (createError) throw createError;

    // 4. Copy all tracks to new playlist
    if (sourceTracks && sourceTracks.length > 0) {
        const trackInserts = sourceTracks.map((track, index) => ({
            playlist_id: newPlaylist.id,
            spotify_track_id: track.spotify_track_id,
            spotify_album_id: track.spotify_album_id,
            position: index,
            added_by: user.id
        }));

        const { error: insertError } = await supabase
            .from('playlist_items')
            .insert(trackInserts);

        if (insertError) throw insertError;
    }

    return newPlaylist;
}