import { supabase } from '../../../lib/supabaseClient';
import type { ItemType } from '../../../types/global';

/**
 * Add an item to favourites
 */
export async function addToFavourites(itemId: string, itemType: ItemType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('favorites')
        .upsert(
            {
                user_id: user.id,
                item_id: itemId,
                item_type: itemType
            },
            {
                onConflict: 'user_id,item_id,item_type',
                ignoreDuplicates: true
            }
        );

    if (error) throw error;
}

/**
 * Remove an item from favourites
 */
export async function removeFromFavourites(itemId: string, itemType: ItemType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

    if (error) throw error;
}

/**
 * Check if an item is in favourites
 */
export async function checkIsFavourite(itemId: string, itemType: ItemType): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .maybeSingle();

    if (error) {
        console.error('Error checking favourite:', error);
    }

    return !!data;
}

/**
 * Get all favourite tracks for the current user
 */
export async function getFavouriteTracks(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'track')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.item_id);
}

/**
 * Get all favourite playlists for the current user
 */
export async function getFavouritePlaylists(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'playlist')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.item_id);
}

/**
 * Get all favourite albums for the current user
 */
export async function getFavouriteAlbums(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'album')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.item_id);
}
