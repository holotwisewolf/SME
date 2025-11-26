import type { Database } from './supabase';

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagType = Database['public']['Enums']['tag_type'];
export type ItemType = Database['public']['Enums']['item_type'];
export type Rating = Database['public']['Tables']['ratings']['Row'];
export type RatingInsert = Database['public']['Tables']['ratings']['Insert'];
export type RatingUpdate = Database['public']['Tables']['ratings']['Update'];
export type ItemStats = Database['public']['Tables']['item_stats']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];