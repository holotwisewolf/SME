// src/lib/spotify.ts
import { supabase } from "../../../lib/supabaseClient";

/**
 * Spotify API Client
 * Handles token retrieval via Supabase Edge Function + caching.
 */

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Retrieve Spotify Token from Edge Function
 * Includes caching + safety fallback
 */
export async function getSpotifyToken(): Promise<string> {
  // Reuse cached token if valid (5-minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const { data, error } = await supabase.functions.invoke<{
    access_token?: string;
    expires_in?: number;
  }>("spotify-token");

  if (error) {
    console.error("Supabase Edge error:", error);
    throw new Error(`Failed to get Spotify token: ${error.message}`);
  }

  if (!data?.access_token) {
    console.error("Invalid token payload:", data);
    throw new Error("Spotify token not returned from Edge Function");
  }

  // Cache for reuse
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;

  return cachedToken;
}

/**
 * Authenticated Spotify Fetch
 * Adds correct base URL + improved error handling
 */
export async function spotifyFetch<T = any>(
  endpoint: string,
  fetchOptions: RequestInit = {}
): Promise<T> {
  const token = await getSpotifyToken();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `https://api.spotify.com/v1/${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
  })

  // Check for 429 errors and retry-after headers
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    console.error(`API Rate Limit Hit! You are banned for ${retryAfter} seconds.`);
    throw new Error(`Spotify API Rate Limit Exceeded. Try again in ${retryAfter} seconds.`);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    console.error("Spotify error response:", errorBody);

    const msg =
      errorBody?.error?.message ||
      res.statusText ||
      "Unknown Spotify API error";

    throw new Error(`Spotify API Error ${res.status}: ${msg}`);
  }

  return res.json();
}

/**
 * Clear cached token
 * Useful if debugging or forcing refresh
 */
export function clearSpotifyToken(): void {
  cachedToken = null;
  tokenExpiry = null;
}
