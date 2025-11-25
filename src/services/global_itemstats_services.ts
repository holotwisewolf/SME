// itemStats_service.ts (aggregated global stats)
import { supabase } from "../lib/supabaseClient";

export type ItemType = "track" | "album" | "playlist";

export interface ItemStats {
    id: string;
    item_id: string;
    item_type: ItemType;
    average_rating: number | null;
    rating_count: number | null;
    comment_count: number | null;
    favorite_count: number | null;
    tag_count: number | null;
    created_at: string | null;
    updated_at: string | null;
}

/**
 * Fetch full item stats (one row per item).
 */
export async function getItemStats(
    itemId: string,
    itemType: ItemType
): Promise<ItemStats | null> {
    const { data, error } = await supabase
        .from("item_stats")
        .select("*")
        .eq("item_id", itemId)
        .eq("item_type", itemType)
        .single();

    // Row not found (PGRST116)
    if (error && error.code === "PGRST116") return null;
    if (error) throw error;

    return data as ItemStats;
}

/**
 * Lightweight wrapper if you only want rating info.
 */
export async function getGlobalRating(
    itemId: string,
    itemType: ItemType
): Promise<{ average_rating: number; rating_count: number } | null> {
    const stats = await getItemStats(itemId, itemType);
    if (!stats) return null;

    return {
        average_rating: stats.average_rating ?? 0,
        rating_count: stats.rating_count ?? 0,
    };
}

/**
 * Wrapper specifically for average rating only.
 */
export async function getAverageRating(
    itemId: string,
    itemType: ItemType
): Promise<number | null> {
    const stats = await getItemStats(itemId, itemType);
    return stats?.average_rating ?? null;
}
