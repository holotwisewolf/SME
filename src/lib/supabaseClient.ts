// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance: ReturnType<typeof createClient<Database>>;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )

  // Create a proxy that throws a helpful error when any property is accessed
  // This prevents the app from crashing on load, but will fail if Supabase is actually used
  supabaseInstance = new Proxy({} as any, {
    get: () => {
      throw new Error(
        'Supabase is not initialized. Missing environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.'
      )
    }
  })
} else {
  // Validate URL format
  try {
    new URL(supabaseUrl)

    // Validate anon key format (basic check for UUID-like structure)
    if (supabaseAnonKey.length < 20) {
      console.warn('Invalid VITE_SUPABASE_ANON_KEY format. Key appears to be too short.')
    }

    // Create and export the Supabase client
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  } catch (e) {
    console.error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Must be a valid URL.`)
    supabaseInstance = new Proxy({} as any, {
      get: () => {
        throw new Error(
          `Supabase initialization failed: Invalid URL ${supabaseUrl}`
        )
      }
    })
  }
}

export const supabase = supabaseInstance;

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