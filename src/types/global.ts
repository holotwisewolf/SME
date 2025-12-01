import type { Database } from './supabase';

export type ItemType = Database['public']['Enums']['item_type_enum'];
export type ItemStats = Database['public']['Tables']['item_stats']['Row'];