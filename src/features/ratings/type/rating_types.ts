import type { Database } from '../../../types/supabase';

export type Rating = Database['public']['Tables']['ratings']['Row'];
export type RatingInsert = Database['public']['Tables']['ratings']['Insert'];
export type RatingUpdate = Database['public']['Tables']['ratings']['Update'];
