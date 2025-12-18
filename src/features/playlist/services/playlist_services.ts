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
    const { data: basePlaylists, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    if (!basePlaylists || basePlaylists.length === 0) return { playlists: [], favoriteIds: new Set() };

    const playlistIds = basePlaylists.map(p => p.id);

    const [ratingsRes, commentsRes, tagsRes, favoritesRes] = await Promise.all([
        supabase.from('ratings').select('item_id, rating, created_at, updated_at, user_id').eq('item_type', 'playlist').in('item_id', playlistIds),
        supabase.from('comments').select('item_id, created_at, updated_at').eq('item_type', 'playlist').in('item_id', playlistIds),
        supabase.from('item_tags').select('item_id, created_at, user_id, tags(name)').eq('item_type', 'playlist').in('item_id', playlistIds),
        supabase.from('favorites').select('item_id').eq('user_id', userId).eq('item_type', 'playlist')
    ]);

    const favoriteIds = new Set((favoritesRes.data || []).map(f => f.item_id));

    const playlists: EnhancedPlaylist[] = basePlaylists.map(p => {
        const allRatings = ratingsRes.data?.filter(r => r.item_id === p.id) || [];
        const userRatings = allRatings.filter(r => r.user_id === userId);
        
        const ratingAvg = allRatings.length > 0 ? allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length : 0;
        const ratedAt = allRatings.length > 0 ? allRatings.reduce((latest, curr) => { const currTime = getLatestTime(curr); return new Date(currTime) > new Date(latest) ? currTime : latest; }, getLatestTime(allRatings[0])) : undefined;

        const myRating = userRatings.length > 0 ? userRatings[0].rating : 0;
        const myRatedAt = userRatings.length > 0 ? getLatestTime(userRatings[0]) : undefined;

        const pComments = commentsRes.data?.filter(c => c.item_id === p.id) || [];
        const commentedAt = pComments.length > 0 ? pComments.reduce((latest, curr) => { const currTime = getLatestTime(curr); return new Date(currTime) > new Date(latest) ? currTime : latest; }, getLatestTime(pComments[0])) : undefined;

        const allTags = tagsRes.data?.filter(t => t.item_id === p.id) || [];
        const myTagsRaw = allTags.filter(t => t.user_id === userId);

        // @ts-ignore
        const globalTagNames = Array.from(new Set(allTags.map(t => t.tags?.name).filter(Boolean)));
        // @ts-ignore
        const myTagNames = Array.from(new Set(myTagsRaw.map(t => t.tags?.name).filter(Boolean)));

        const taggedAt = allTags.length > 0 ? allTags.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, allTags[0].created_at) : undefined;
        const myTaggedAt = myTagsRaw.length > 0 ? myTagsRaw.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, myTagsRaw[0].created_at) : undefined;

        return {
            ...p,
            rating_avg: ratingAvg,
            rating_count: allRatings.length,
            rated_at: ratedAt,
            comment_count: pComments.length,
            commented_at: commentedAt,
            tag_count: allTags.length,
            tags: globalTagNames,
            tagged_at: taggedAt,
            user_rating: myRating,
            user_rated_at: myRatedAt,
            user_tags: myTagNames,
            user_tag_count: myTagsRaw.length,
            user_tagged_at: myTaggedAt
        };
    });

    return { playlists, favoriteIds };
}

export async function getPlaylistStats(playlistId: string, userId: string): Promise<Partial<EnhancedPlaylist>> {
    const [ratingsRes, commentsRes, tagsRes] = await Promise.all([
        supabase.from('ratings').select('rating, created_at, updated_at, user_id').eq('item_type', 'playlist').eq('item_id', playlistId),
        supabase.from('comments').select('created_at, updated_at').eq('item_type', 'playlist').eq('item_id', playlistId),
        supabase.from('item_tags').select('created_at, user_id, tags(name)').eq('item_type', 'playlist').eq('item_id', playlistId),
    ]);

    const allRatings = ratingsRes.data || [];
    const userRatings = allRatings.filter(r => r.user_id === userId);
    const ratingAvg = allRatings.length > 0 ? allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length : 0;
    const ratedAt = allRatings.length > 0 ? allRatings.reduce((latest, curr) => { const currTime = getLatestTime(curr); return new Date(currTime) > new Date(latest) ? currTime : latest; }, getLatestTime(allRatings[0])) : undefined;
    
    const pComments = commentsRes.data || [];
    const commentedAt = pComments.length > 0 ? pComments.reduce((latest, curr) => { const currTime = getLatestTime(curr); return new Date(currTime) > new Date(latest) ? currTime : latest; }, getLatestTime(pComments[0])) : undefined;

    const allTags = tagsRes.data || [];
    const myTagsRaw = allTags.filter(t => t.user_id === userId);
    // @ts-ignore
    const globalTagNames = Array.from(new Set(allTags.map(t => t.tags?.name).filter(Boolean)));
    // @ts-ignore
    const myTagNames = Array.from(new Set(myTagsRaw.map(t => t.tags?.name).filter(Boolean)));
    const taggedAt = allTags.length > 0 ? allTags.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, allTags[0].created_at) : undefined;
    const myTaggedAt = myTagsRaw.length > 0 ? myTagsRaw.reduce((latest, curr) => new Date(curr.created_at) > new Date(latest) ? curr.created_at : latest, myTagsRaw[0].created_at) : undefined;

    return {
        rating_avg: ratingAvg,
        rating_count: allRatings.length,
        rated_at: ratedAt,
        comment_count: pComments.length,
        commented_at: commentedAt,
        tag_count: allTags.length,
        tags: globalTagNames,
        tagged_at: taggedAt,
        user_rating: userRatings.length > 0 ? userRatings[0].rating : 0,
        user_rated_at: userRatings.length > 0 ? getLatestTime(userRatings[0]) : undefined,
        user_tags: myTagNames,
        user_tag_count: myTagsRaw.length,
        user_tagged_at: myTaggedAt
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