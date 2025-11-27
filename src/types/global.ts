import type { Database } from './supabase';

export type ItemType = Database['public']['Enums']['item_type'];
export type ItemStats = Database['public']['Tables']['item_stats']['Row'];