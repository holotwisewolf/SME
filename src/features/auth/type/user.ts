import type { Database } from '../../../types/supabase';
import type { User } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type AuthUser = User;
