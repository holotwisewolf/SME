// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { type Database } from './types/supabase' // Import the auto-generated types

// 1. Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Create the client with the <Database> generic
// This tells VS Code: "Use the rules from my database schema"
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)