import { supabase } from '../../../lib/supabaseClient';
import type { ItemType } from '../../../types/global';

/**
 * Get average rating for an item
 */
export async function getItemRating(itemId: string, itemType: ItemType): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
        .from('item_stats')
        .select('average_rating, rating_count')
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .maybeSingle();

    if (error) throw error;

    if (!data) return { average: 0, count: 0 };

    return {
        average: data.average_rating || 0,
        count: data.rating_count || 0
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

    // Check if rating exists
    const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .maybeSingle();

    let error;

    if (existingRating) {
        // Update existing
        const result = await supabase
            .from('ratings')
            .update({
                rating: rating,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingRating.id);
        error = result.error;
    } else {
        // Insert new
        const result = await supabase
            .from('ratings')
            .insert({
                item_id: itemId,
                item_type: itemType,
                user_id: user.id,
                rating: rating
            });
        error = result.error;
    }

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
 * Add a tag to an item (only removes current user's tag)
 * Tag names are sanitized to lowercase letters only
 */
export async function addItemTag(itemId: string, itemType: ItemType, tag: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Sanitize tag name: lowercase letters only
    const sanitizedTag = tag.toLowerCase().replace(/[^a-z]/g, '');
    if (!sanitizedTag) throw new Error('Tag must contain at least one letter');

    // 1. Check if tag exists
    let tagId: string;
    const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', sanitizedTag)
        .maybeSingle();

    if (existingTag) {
        tagId = existingTag.id;
    } else {
        // 2. Create new tag if not exists
        const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({
                name: sanitizedTag,
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
