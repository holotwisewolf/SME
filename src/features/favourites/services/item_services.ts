import { supabase } from '../../../lib/supabaseClient';
import type { ItemType } from '../../../types/global';

/**
 * Get average rating for an item
 */
export async function getItemRating(itemId: string, itemType: ItemType): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('item_id', itemId)
        .eq('item_type', itemType);

    if (error) throw error;

    if (!data || data.length === 0) return { average: 0, count: 0 };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
        average: sum / data.length,
        count: data.length
    };
}

/**
 * Get user's rating for an item
 */
export async function getUserItemRating(itemId: string, itemType: ItemType): Promise<number | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;

    return data ? data.rating : null;
}

/**
 * Update item rating
 */
export async function updateItemRating(itemId: string, itemType: ItemType, rating: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('ratings')
        .upsert({
            item_id: itemId,
            item_type: itemType,
            user_id: user.id,
            rating: rating
        }, { onConflict: 'item_id, item_type, user_id' });

    if (error) throw error;
}

/**
 * Delete item rating
 */
export async function deleteItemRating(itemId: string, itemType: ItemType): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .eq('user_id', user.id);

    if (error) throw error;
}

/**
 * Get comments for an item
 */
export async function getItemComments(itemId: string, itemType: ItemType): Promise<any[]> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles(
                username,
                display_name,
                avatar_url
            )
        `)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Add a comment to an item
 */
export async function addItemComment(itemId: string, itemType: ItemType, content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('comments')
        .insert({
            item_id: itemId,
            item_type: itemType,
            user_id: user.id,
            content: content
        });

    if (error) throw error;
}

/**
 * Add a tag to an item
 */
export async function addItemTag(itemId: string, itemType: ItemType, tag: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Check if tag exists
    let tagId: string;
    const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tag)
        .maybeSingle();

    if (existingTag) {
        tagId = existingTag.id;
    } else {
        // 2. Create new tag if not exists
        const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({
                name: tag,
                type: 'custom',
                creator_id: user.id
            })
            .select('id')
            .single();

        if (createError) throw createError;
        tagId = newTag.id;
    }

    // 3. Link tag to item
    const { error } = await supabase
        .from('item_tags')
        .insert({
            item_id: itemId,
            item_type: itemType,
            tag_id: tagId,
            user_id: user.id
        });

    if (error) {
        // Ignore duplicate key error (PostgreSQL 23505) or HTTP 409 Conflict
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('conflict')) {
            return; // Silently ignore duplicate tags
        }
        throw error;
    }
}

/**
 * Remove a tag from an item (only removes current user's tag)
 */
export async function removeItemTag(itemId: string, itemType: ItemType, tag: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Get tag ID
    const { data: tagData } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tag)
        .maybeSingle();

    if (!tagData) return;

    // 2. Remove link (only for current user)
    const { error } = await supabase
        .from('item_tags')
        .delete()
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .eq('tag_id', tagData.id)
        .eq('user_id', user.id);

    if (error) throw error;
}
