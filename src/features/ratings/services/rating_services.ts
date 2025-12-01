import { supabase } from '../../../lib/supabaseClient';
import type { Rating } from '../type/rating_types';
import type { ItemType } from '../../../types/global';
import type { IRatingService } from '../contracts/rating_contracts';

/**
 * Create or update a user's rating for an item.
 */
export async function submitPersonalRating(
    userId: string,
    itemId: string,
    itemType: ItemType,
    ratingValue: number
    // Removed isPublic argument
): Promise<Rating[]> {
    const { data, error } = await supabase
        .from('ratings')
        .upsert(
            {
                user_id: userId,
                item_id: itemId,
                item_type: itemType,
                rating: ratingValue,
                // Visibility is handled by RLS policies checking profiles.is_public_profile
            },
            {
                onConflict: 'user_id,item_id,item_type',
                ignoreDuplicates: false,
            }
        )
        .select();

    if (error) {
        console.error('Error submitting personal rating:', error);
        throw new Error(`Failed to submit personal rating: ${error.message}`);
    }

    // Fire-and-forget activity log
    supabase
        .from('activity_log')
        .insert({
            user_id: userId,
            item_id: itemId,
            item_type: itemType,
            activity_type: 'rating',
        })
        .then(({ error }) => {
            if (error) console.warn('Activity log failed:', error);
        });

    return data;
}

/**
 * Update a rating's numerical value.
 */
export async function updateRating(ratingId: string, newRating: number): Promise<Rating[]> {
    const { data, error } = await supabase
        .from('ratings')
        .update({
            rating: newRating,
            updated_at: new Date().toISOString(),
        })
        .eq('id', ratingId)
        .select();

    if (error) {
        console.error('Error updating rating:', error);
        throw new Error(`Failed to update rating: ${error.message}`);
    }

    if (!data?.length) {
        throw new Error(`Rating with ID ${ratingId} not found.`);
    }

    return data;
}

/**
 * Delete a rating.
 */
export async function deleteRating(ratingId: string): Promise<void> {
    const { error } = await supabase.from('ratings').delete().eq('id', ratingId);
    if (error) {
        console.error('Error deleting rating:', error);
        throw new Error(`Failed to delete rating: ${error.message}`);
    }
}

/**
 * Get a user's rating for an item.
 */
export async function getPersonalRating(
    userId: string,
    itemId: string,
    itemType: ItemType
): Promise<Rating | null> {
    const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .maybeSingle(); 

    if (error) {
        console.error('Error fetching personal rating:', error);
        throw new Error(`Failed to fetch personal rating: ${error.message}`);
    }

    return data;
}

/**
 * Get rating-related activity history.
 */
export async function getRatingHistory(
    userId: string,
    page = 0,
    limit = 10
): Promise<any[]> {
    const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', 'rating')
        .order('created_at', { ascending: false })
        .range(page * limit, page * limit + limit - 1);

    if (error) {
        console.error('Error fetching rating history:', error);
        throw new Error(`Failed to fetch rating history: ${error.message}`);
    }

    return data;
}

/**
 * Subscribe to realtime rating changes for a specific item.
 */
export function subscribeToRatingUpdates(
    itemId: string,
    itemType: ItemType,
    callback: (payload: {
        old: Rating | null;
        new: Rating | null;
        eventType: 'UPDATE' | 'INSERT' | 'DELETE';
    }) => void
) {
    const channel = supabase
        .channel(`item_ratings:${itemId}:${itemType}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'ratings',
                filter: `item_id=eq.${itemId},item_type=eq.${itemType}`,
            },
            (payload) => {
                callback({
                    old: payload.old as Rating | null,
                    new: payload.new as Rating | null,
                    eventType: payload.eventType as 'UPDATE' | 'INSERT' | 'DELETE',
                });
            }
        )
        .subscribe();

    return channel;
}

export const RatingService: IRatingService = {
    submitPersonalRating,
    updateRating,
    deleteRating,
    getPersonalRating,
    // Removed toggleRatingPrivacy
    getRatingHistory,
    subscribeToRatingUpdates
};