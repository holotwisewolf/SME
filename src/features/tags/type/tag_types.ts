import type { Database } from '../../../types/supabase';

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagType = Database['public']['Enums']['tag_type'];
