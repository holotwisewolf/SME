// src/services/spotify_tag.ts

import { supabase, type Database } from '../lib/supabaseClient';

// Derive types automatically
// "Database['public']['Enums']['tag_type']" automatically means "premade" | "custom"
export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagType = Database['public']['Enums']['tag_type']; 
export type ItemType = Database['public']['Enums']['item_type']; 



async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to perform this action.");
  }
  return user.id;
}
/**
 *  1. Fetch All Tags
 */
export async function getAllTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  return data;
}

/**
 *  2. Fetch Only Pre-made Tags (System Tags)
 */
export async function getPreMadeTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('type', 'premade') // ✅ Filter by type
    .order('name');

  if (error) throw error;
  return data;
}

/**
 *  3. Fetch User Custom Tags
 */
export async function getUserCustomTags() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('type', 'custom') 
    .eq('creator_id', userId)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 *  4. Create Tag (With Type Support!)
 * Defaults to 'custom' if not specified.
 */
export async function createTag(tagName: string, type: TagType = 'custom') {
  const userId = await getCurrentUserId(); // 动态获取 ID

  const { data, error } = await supabase
    .from('tags')
    .insert([{ 
      name: tagName, 
      type: type, 
      creator_id: userId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 *  5. Assign Tag to Item
 */
export async function assignTagToItem(itemId: string, itemType: ItemType, tagId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('item_tags')
    .insert([{ 
        item_id: itemId, 
        item_type: itemType, 
        tag_id: tagId,
        user_id: userId
    }]);

  if (error && error.code !== '23505') throw error;
}

/**
 *  6. Remove Tag from Item
 */
export async function removeTagFromItem(itemId: string, itemType: ItemType, tagId: string) {
  const { error } = await supabase
    .from('item_tags')
    .delete()
    .match({ 
      item_id: itemId, 
      item_type: itemType,
      tag_id: tagId 
    });

  if (error) throw error;
}

/**
 *  7. Get Tags for Item
 */
export async function getItemTags(itemId: string, itemType: ItemType) {
  const { data, error } = await supabase
    .from('item_tags')
    .select(`
      tag_id,
      tags ( * )
    `)
    .eq('item_id', itemId)
    .eq('item_type', itemType);

  if (error) {
    console.error('Error fetching item tags:', error);
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => item.tags) as Tag[];
}

/**
 *  8. Search Tags
 */
export async function searchTags(query: string) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data as Tag[];
}

// Legacy support
export async function createCustomTag(name: string) {
  return createTag(name, 'custom');
}