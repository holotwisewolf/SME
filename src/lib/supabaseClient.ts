// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(
    `Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Must be a valid URL.`
  )
}

// Validate anon key format (basic check for UUID-like structure)
if (supabaseAnonKey.length < 20) {
  throw new Error(
    'Invalid VITE_SUPABASE_ANON_KEY format. Key appears to be too short.'
  )
}

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure auth flow
  },
  global: {
    headers: {
      'x-application-name': 'your-app-name', // Optional: helps with debugging
    },
  },
})

// Export types for convenience
export type { Database }

// Helper function to check if Supabase is properly initialized
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Supabase connection check failed:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Supabase connection check failed:', err)
    return false
  }
}