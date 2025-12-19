// src/services/spotify_tag.ts

import { supabase } from '../../../lib/supabaseClient';
import type { Tag, TagType } from '../type/tag_types';
import type { ItemType } from '../../../types/global';
import type { ITagService } from '../contracts/tag_contracts';

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to perform this action.");
  return user.id;
}

/**
 * Fetch all tags (system + custom)
 */
export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select()
    .order('name');

  if (error) throw new Error(`Failed to fetch tags: ${error.message}`);
  return data ?? [];
}

/**
 * Fetch system-created premade tags
 */
export async function getPreMadeTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select()
    .eq('type', 'premade')
    .order('name');

  if (error) throw new Error(`Failed to fetch premade tags: ${error.message}`);
  return data ?? [];
}

/**
 * Fetch user-created custom tags
 */
export async function getUserCustomTags(): Promise<Tag[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tags')
    .select()
    .eq('type', 'custom')
    .eq('creator_id', userId)
    .order('name');

  if (error) throw new Error(`Failed to fetch user tags: ${error.message}`);
  return data ?? [];
}

/**
 * Create a tag (custom or premade)
 * If a tag with the same name and type already exists, returns the existing tag
 */
export async function createTag(
  tagName: string,
  type: TagType = 'custom'
): Promise<Tag> {
  const userId = await getCurrentUserId();

  // First, check if tag already exists
  const { data: existingTag } = await supabase
    .from('tags')
    .select()
    .eq('name', tagName)
    .eq('type', type)
    .maybeSingle();

  // If tag exists, return it instead of creating duplicate
  if (existingTag) {
    return existingTag;
  }

  // Create new tag
  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: tagName,
      type,
      creator_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create tag: ${error.message}`);
  return data;
}

/**
 * Assign tag to an item
 */
export async function assignTagToItem(
  itemId: string,
  itemType: ItemType,
  tagId: string
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('item_tags')
    .insert({
      item_id: itemId,
      item_type: itemType,
      tag_id: tagId,
      user_id: userId,
    });

  // Ignore duplicate mapping error
  if (error && error.code !== '23505') {
    throw new Error(`Failed to assign tag: ${error.message}`);
  }
}

/**
 * Remove tag from an item
 */
export async function removeTagFromItem(
  itemId: string,
  itemType: ItemType,
  tagId: string
): Promise<void> {
  const { error } = await supabase
    .from('item_tags')
    .delete()
    .match({ item_id: itemId, item_type: itemType, tag_id: tagId });

  if (error) throw new Error(`Failed to remove tag: ${error.message}`);
}

/**
 * Get all tags applied to an item
 */
export async function getItemTags(
  itemId: string,
  itemType: ItemType
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('item_tags')
    .select(`
      tag_id,
      tags (*)
    `)
    .eq('item_id', itemId)
    .eq('item_type', itemType);

  if (error) {
    throw new Error(`Failed to fetch item tags: ${error.message}`);
  }

  return (data ?? []).map((entry) => entry.tags as Tag);
}

/**
 * Get tags applied to an item by a specific user (creator)
 * Also includes system tags (where creator_id is null)
 */
export async function getCreatorItemTags(
  itemId: string,
  itemType: ItemType,
  creatorUserId: string
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('item_tags')
    .select(`
      tag_id,
      user_id,
      tags (*)
    `)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .or(`user_id.eq.${creatorUserId},user_id.is.null`);

  if (error) {
    throw new Error(`Failed to fetch creator tags: ${error.message}`);
  }

  return (data ?? []).map((entry) => entry.tags as Tag);
}

/**
 * Search for tags by name
 */
export async function searchTags(query: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select()
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) throw new Error(`Failed to search tags: ${error.message}`);
  return data ?? [];
}

/**
 * Legacy alias for createTag(..., "custom")
 */
export function createCustomTag(name: string) {
  return createTag(name, 'custom');
}

export const TagService: ITagService = {
  getAllTags,
  getPreMadeTags,
  getUserCustomTags,
  createTag,
  assignTagToItem,
  removeTagFromItem,
  getItemTags,
  searchTags,
  createCustomTag
};
