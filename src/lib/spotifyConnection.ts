// src/lib/spotify.ts
import { supabase } from './supabaseClient'

/**
 * Spotify API client
 * Handles authentication and low-level API communication
 */

let cachedToken: string | null = null
let tokenExpiry: number | null = null

/**
 * Get Spotify access token from Edge Function
 * Implements basic caching to avoid unnecessary requests
 */
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken
  }

  const { data, error } = await supabase.functions.invoke<{ 
    access_token: string
    expires_in?: number 
  }>('spotify-token')

  if (error) {
    throw new Error(`Failed to get Spotify token: ${error.message}`)
  }

  if (!data?.access_token) {
    throw new Error('No access token returned from Spotify')
  }

  // Cache the token (default expiry: 1 hour)
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000

  return cachedToken
}

/**
 * Make authenticated request to Spotify API
 * Low-level fetch wrapper
 */
export async function spotifyFetch<T = any>(endpoint: string): Promise<T> {
  const token = await getSpotifyToken()

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://api.spotify.com/v1/${endpoint}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(
      `Spotify API Error ${res.status}: ${error.error?.message || res.statusText}`
    )
  }

  return res.json()
}

/**
 * Clear cached token (useful for logout or token refresh)
 */
export function clearSpotifyToken(): void {
  cachedToken = null
  tokenExpiry = null
}