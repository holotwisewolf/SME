import { supabase } from '../../../lib/supabaseClient';

// get user basic info
export async function getPublicProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// calculate user average rating given
export async function getUserAverageRating(userId: string): Promise<string> {
    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) return '0.0';

    const total = data.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / data.length).toFixed(1);
}

// get user recent comments
export async function getUserComments(userId: string, page: number, limit: number = 20) {
    const from = page * limit;
    const to = from + limit - 1;

    //  join get item details
    const { data, error, count } = await supabase
        .from('comments')
        .select(`
            *,
            profiles:user_id (username, avatar_url, display_name)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { data, count };
}

// get user recent rating (Preview)
export async function getUserRecentRatings(userId: string, limit: number = 5) {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// get user recent favorites (Preview)
// depend on fav Track/Album/Playlist (fav table)
export async function getUserRecentFavorites(userId: string, limit: number = 5) {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

//get user playlists
export async function getUserPublicPlaylists(userId: string) {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    
    // URL
    return data.map(playlist => {
        const { data: publicUrl } = supabase.storage
            .from('playlists')
            .getPublicUrl(playlist.id);
            
        return {
            ...playlist,
            imageUrl: publicUrl.publicUrl
        };
    });
}