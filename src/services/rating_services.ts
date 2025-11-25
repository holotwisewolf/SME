// src/services/rating_services.ts

import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/supabase';

// Define type aliases for better readability and type safety, leveraging Supabase's generated types.
export type Rating = Database['public']['Tables']['ratings']['Row'];
export type RatingInsert = Database['public']['Tables']['ratings']['Insert'];
export type RatingUpdate = Database['public']['Tables']['ratings']['Update'];
export type ItemType = Database['public']['Enums']['item_type'];
export type ItemStats = Database['public']['Tables']['item_stats']['Row'];

/**
 * Submits a new personal rating for an item (track, album, or playlist).
 * If a rating for this user/item/type combination already exists, it will be updated (upsert behavior).
 * Also logs the activity in the 'activity_log' table.
 *
 * @param {string} userId - The UUID of the user submitting the rating.
 * @param {string} itemId - The unique identifier of the item (e.g., Spotify ID or internal playlist UUID).
 * @param {ItemType} itemType - The type of item being rated ('track', 'album', 'playlist').
 * @param {number} ratingValue - The rating value (e.g., 1-10).
 * @param {boolean} isPublic - Whether this specific rating should be publicly visible.
 * @returns {Promise<Rating[]>} A promise that resolves to the created or updated rating record(s).
 * @throws {Error} If the submission to the 'ratings' table fails.
 */
export async function submitPersonalRating(
  userId: string,
  itemId: string,
  itemType: ItemType,
  ratingValue: number,
  isPublic: boolean
): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      rating: ratingValue,
      is_public: isPublic,
      // 'created_at' and 'updated_at' usually handled by database defaults/triggers
    }, {
      onConflict: 'user_id,item_id,item_type', // Specifies the unique constraint for upsert operation
      ignoreDuplicates: false // Ensures an update occurs if a conflict is found
    })
    .select(); // Selects the newly created/updated row(s)

  if (error) {
    console.error('Error submitting personal rating:', error);
    throw new Error(`Failed to submit personal rating: ${error.message}`);
  }

  // --- Log Activity ---
  // Attempt to log the rating submission as an activity.
  // This operation is independent of the rating submission's success/failure.
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      activity_type: 'rating', // Assuming 'rating' is a predefined enum value for activity_type
    });
  } catch (activityError) {
    console.warn('Warning: Failed to log rating activity:', activityError);
    // We only log a warning here and do not re-throw,
    // as the primary rating submission was successful.
  }

  return data;
}

/**
 * Updates an existing personal rating record with a new rating value.
 * Automatically updates the 'updated_at' timestamp.
 *
 * @param {string} ratingId - The UUID of the specific rating record to update.
 * @param {number} newRating - The new rating value (e.g., 1-10).
 * @returns {Promise<Rating[]>} A promise that resolves to the updated rating record(s).
 * @throws {Error} If the update fails or if the specified `ratingId` is not found.
 */
export async function updateRating(ratingId: string, newRating: number): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .update({
      rating: newRating,
      updated_at: new Date().toISOString() // Set current timestamp
    })
    .eq('id', ratingId) // Target the specific rating by its ID
    .select();

  if (error) {
    console.error('Error updating rating:', error);
    throw new Error(`Failed to update rating: ${error.message}`);
  }
  if (!data || data.length === 0) {
    // If no data is returned, it means the ratingId was not found or no changes were made.
    throw new Error(`Rating with ID ${ratingId} not found or no changes were applied.`);
  }
  return data;
}

/**
 * Deletes a personal rating record from the database.
 *
 * @param {string} ratingId - The UUID of the rating record to delete.
 * @returns {Promise<void>} A promise that resolves when the rating is successfully deleted.
 * @throws {Error} If the deletion fails.
 */
export async function deleteRating(ratingId: string): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('id', ratingId); // Target the specific rating by its ID

  if (error) {
    console.error('Error deleting rating:', error);
    throw new Error(`Failed to delete rating: ${error.message}`);
  }
}

/**
 * Retrieves a specific user's personal rating for a given item.
 *
 * @param {string} userId - The UUID of the user whose rating is to be retrieved.
 * @param {string} itemId - The unique identifier of the item.
 * @param {ItemType} itemType - The type of item ('track', 'album', 'playlist').
 * @returns {Promise<Rating | null>} A promise that resolves to the rating record or null if no rating is found.
 * @throws {Error} If the retrieval fails for reasons other than "no rows found".
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
    .single(); // Expects a single row; will error if more than one or zero rows are returned

  if (error && error.code === 'PGRST116') {
    // Supabase's PostgREST returns 'PGRST116' when no rows are found for .single()
    return null; // Return null if no rating exists
  }
  if (error) {
    console.error('Error fetching personal rating:', error);
    throw new Error(`Failed to fetch personal rating: ${error.message}`);
  }
  return data;
}

/**
 * Retrieves the global rating data (average rating and total count of ratings) for an item.
 * This function now queries the 'item_stats' table directly to get pre-calculated statistics.
 * It replaces the previous reliance on a PostgreSQL RPC function `calculate_avg_rating`.
 *
 * @param {string} itemId - The unique identifier of the item.
 * @param {ItemType} itemType - The type of item ('track', 'album', 'playlist').
 * @returns {Promise<{ average_rating: number; rating_count: number } | null>} A promise that resolves to the average rating and count, or null if no stats are found.
 * @throws {Error} If the database query fails for reasons other than "no rows found".
 */
export async function getGlobalRating(
  itemId: string,
  itemType: ItemType
): Promise<{ average_rating: number; rating_count: number } | null> {
  // Query the pre-calculated statistics from the item_stats table.
  const { data, error } = await supabase
    .from('item_stats')
    .select('average_rating, rating_count') // Select only the fields needed
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .single(); // Assuming each item has only one row of statistics.

  if (error && error.code === 'PGRST116') {
    // Supabase's PostgREST returns 'PGRST116' when no rows are found for .single()
    // This means that there are no statistics (i.e., no rating) for this item yet.
    return null; // If no statistics are found, return null.

}
  if (error) {
    console.error('Error fetching global rating from item_stats:', error);
    throw new Error(`Failed to fetch global rating from item_stats: ${error.message}`);
  }

  // The `average_rating` and `rating_count` fields in the `item_stats` table may be nullable.

// Here, we convert them to numbers, defaulting to 0 if null, to conform to the Promise return type.
  return {
    average_rating: data.average_rating ?? 0,
    rating_count: data.rating_count ?? 0,
  };
}

/**
 * Toggles the public visibility status of a specific rating record.
 * It first fetches the current 'is_public' status and then flips it.
 *
 * @param {string} ratingId - The UUID of the rating record to update.
 * @returns {Promise<Rating[]>} A promise that resolves to the updated rating record(s).
 * @throws {Error} If fetching the current status fails, or if the update fails.
 */
export async function toggleRatingPrivacy(ratingId: string): Promise<Rating[]> {
  // First, fetch the current 'is_public' status of the rating
  const { data: currentRating, error: fetchError } = await supabase
    .from('ratings')
    .select('is_public')
    .eq('id', ratingId)
    .single();

  if (fetchError || !currentRating) {
    console.error('Error fetching rating for privacy toggle:', fetchError);
    throw new Error(`Failed to fetch rating for privacy toggle: ${fetchError?.message || 'Rating not found'}`);
  }

  // Determine the new privacy status
  const newPrivacyStatus = !currentRating.is_public;

  // Update the 'is_public' status and 'updated_at' timestamp
  const { data, error } = await supabase
    .from('ratings')
    .update({
      is_public: newPrivacyStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', ratingId)
    .select();

  if (error) {
    console.error('Error toggling rating privacy:', error);
    throw new Error(`Failed to toggle rating privacy: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(`Rating with ID ${ratingId} not found or no changes were applied.`);
  }
  return data;
}

/**
 * Retrieves a user's entire rating history from the 'activity_log' table.
 * This function provides basic pagination.
 *
 * @param {string} userId - The UUID of the user whose activity log is to be retrieved.
 * @param {number} [page=0] - The page number for pagination (0-indexed). Defaults to 0.
 * @param {number} [limit=10] - The maximum number of records per page. Defaults to 10.
 * @returns {Promise<any[]>} A promise that resolves to an array of activity log entries related to ratings.
 * The structure of these entries will depend on your 'activity_log' table schema.
 * @throws {Error} If the retrieval of activity history fails.
 */
export async function getRatingHistory(userId: string, page: number = 0, limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*') // Select all columns from the activity log entry
    .eq('user_id', userId)
    .eq('activity_type', 'rating') // Filter specifically for rating-related activities
    .order('created_at', { ascending: false }) // Order by most recent activity first
    .range(page * limit, (page + 1) * limit - 1); // Apply pagination range

  if (error) {
    console.error('Error fetching rating history:', error);
    throw new Error(`Failed to fetch rating history: ${error.message}`);
  }
  return data;
}

/**
 * Calculates the average rating for a given item. This function is a convenience wrapper
 * that internally calls `getGlobalRating` and extracts only the average value.
 *
 * @param {string} itemId - The unique identifier of the item.
 * @param {ItemType} itemType - The type of item ('track', 'album', 'playlist').
 * @returns {Promise<number | null>} A promise that resolves to the average rating (a number) or null if no ratings exist or calculation fails.
 * @throws {Error} If the underlying `getGlobalRating` call fails.
 */
export async function calculateAverageRating(
  itemId: string,
  itemType: ItemType
): Promise<number | null> {
  const globalRating = await getGlobalRating(itemId, itemType);
  return globalRating ? globalRating.average_rating : null;
}

/**
 * Subscribes to real-time updates for rating changes related to a specific item.
 * This uses Supabase Realtime functionality.
 *
 * @param {string} itemId - The unique identifier of the item to subscribe to.
 * @param {ItemType} itemType - The type of item ('track', 'album', 'playlist').
 * @param {(payload: { old: Rating | null; new: Rating | null; eventType: 'UPDATE' | 'INSERT' | 'DELETE' }) => void} callback - A callback function that will be invoked with the updated rating payload.
 * `old` and `new` can be null depending on the event type.
 * @returns {ReturnType<typeof supabase.channel>} The Realtime channel instance.
 */
export function subscribeToRatingUpdates(
  itemId: string,
  itemType: ItemType,
  callback: (payload: { old: Rating | null; new: Rating | null; eventType: 'UPDATE' | 'INSERT' | 'DELETE' }) => void
) {
  // Create a unique channel name for this specific item's ratings to avoid conflicts with other subscriptions.
  const channel = supabase
    .channel(`item_ratings:${itemId}:${itemType}`)
    .on(
      'postgres_changes', // Listen to changes in the PostgreSQL database
      {
        event: '*',        // Subscribe to all event types (INSERT, UPDATE, DELETE)
        schema: 'public',  // Specify the database schema where your 'ratings' table resides
        table: 'ratings',
        // Filter for changes only affecting the specific item we are interested in
        filter: `item_id=eq.${itemId},item_type=eq.${itemType}`,
      },
      (payload) => {
        // When a change occurs, invoke the provided callback function with the payload.
        // Payload properties 'old' and 'new' are cast to Rating | null, as they can be null
        // for INSERT (old=null) and DELETE (new=null) events respectively.
        callback({
          old: payload.old as Rating | null,
          new: payload.new as Rating | null,
          eventType: payload.eventType as 'UPDATE' | 'INSERT' | 'DELETE'
        });
      }
    )
    .subscribe(); // Activate the subscription

  // IMPORTANT: The returned channel instance should be used to unsubscribe when the component
  // or context using this subscription unmounts or is no longer needed.
  // For example, in a React functional component, you would typically do:
  // useEffect(() => {
  //   const channel = subscribeToRatingUpdates(...);
  //   return () => {
  //     supabase.removeChannel(channel); // Or channel.unsubscribe();
  //   };
  // }, [itemId, itemType]);
  return channel;
}