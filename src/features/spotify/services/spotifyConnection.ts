// src/lib/spotify.ts
import { supabase } from "../../../lib/supabaseClient";

/**
 * Spotify API Client
 * Handles token retrieval via Supabase Edge Function + caching.
 * Includes rate limit protection with request queue and throttling.
 */

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Rate limiting configuration
const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_DELAY_MS = 100; // Delay between requests
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // Base delay for exponential backoff

// Request queue management
let activeRequests = 0;
const requestQueue: (() => void)[] = [];
const pendingRequests = new Map<string, Promise<any>>(); // Deduplication

/**
 * Process the next request in queue if capacity available
 */
function processQueue() {
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      activeRequests++;
      nextRequest();
    }
  }
}

/**
 * Wait for queue slot
 */
function waitForSlot(): Promise<void> {
  return new Promise((resolve) => {
    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      activeRequests++;
      resolve();
    } else {
      requestQueue.push(() => resolve());
    }
  });
}

/**
 * Release queue slot
 */
function releaseSlot() {
  activeRequests--;
  setTimeout(processQueue, REQUEST_DELAY_MS);
}

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
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Authenticated Spotify Fetch with Rate Limiting
 * - Limits concurrent requests to MAX_CONCURRENT_REQUESTS
 * - Deduplicates identical concurrent requests
 * - Retries on 429 with exponential backoff
 */
export async function spotifyFetch<T = any>(
  endpoint: string,
  fetchOptions: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `https://api.spotify.com/v1/${endpoint}`;

  // Request deduplication - if same URL is already in flight, wait for that result
  const cacheKey = `${fetchOptions.method || 'GET'}:${url}`;
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  const executeRequest = async (): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      await waitForSlot();

      try {
        const token = await getSpotifyToken();

        const res = await fetch(url, {
          ...fetchOptions,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(fetchOptions.headers || {}),
          },
        });

        // Handle rate limiting with retry
        if (res.status === 429) {
          releaseSlot();
          const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
          const delayMs = Math.max(retryAfter * 1000, RETRY_DELAY_BASE * Math.pow(2, attempt));
          console.warn(`Rate limited. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delayMs);
          continue;
        }

        releaseSlot();

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
      } catch (error) {
        releaseSlot();
        lastError = error as Error;

        // Only retry on network errors or rate limits, not on other API errors
        if (attempt < MAX_RETRIES - 1 && (error as Error).message?.includes('Rate Limit')) {
          const delayMs = RETRY_DELAY_BASE * Math.pow(2, attempt);
          console.warn(`Request failed. Retrying in ${delayMs}ms...`);
          await sleep(delayMs);
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  };

  // Store promise for deduplication
  const requestPromise = executeRequest();
  pendingRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Clear cached token
 * Useful if debugging or forcing refresh
 */
export function clearSpotifyToken(): void {
  cachedToken = null;
  tokenExpiry = null;
}
