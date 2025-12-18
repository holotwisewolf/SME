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
const CIRCUIT_BREAKER_COOLDOWN_MS = 60000; // 60 second (1 minute) cooldown when rate limited

// Request queue management
let activeRequests = 0;
const requestQueue: (() => void)[] = [];
const pendingRequests = new Map<string, Promise<any>>(); // Deduplication

// Circuit breaker state - blocks ALL requests when rate limited
let isCircuitOpen = false;
let circuitOpenUntil: number = 0;
let rateLimitCallbacks: ((message: string) => void)[] = [];

/**
 * Register a callback to be notified when rate limit is hit
 * Used by components to show error messages via ErrorContext
 */
export function onRateLimitError(callback: (message: string) => void): () => void {
  rateLimitCallbacks.push(callback);
  return () => {
    rateLimitCallbacks = rateLimitCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Notify all registered callbacks about rate limit
 */
function notifyRateLimitError(message: string) {
  rateLimitCallbacks.forEach(cb => cb(message));
}

/**
 * Check if circuit breaker is open (blocking requests)
 */
export function isRateLimited(): boolean {
  if (isCircuitOpen && Date.now() < circuitOpenUntil) {
    return true;
  }
  // Auto-reset circuit if cooldown passed
  if (isCircuitOpen && Date.now() >= circuitOpenUntil) {
    isCircuitOpen = false;
  }
  return false;
}

/**
 * Open the circuit breaker - blocks ALL requests for cooldown period
 */
function openCircuitBreaker(retryAfterSeconds: number) {
  const cooldownMs = Math.max(retryAfterSeconds * 1000, CIRCUIT_BREAKER_COOLDOWN_MS);
  isCircuitOpen = true;
  circuitOpenUntil = Date.now() + cooldownMs;

  // Clear the request queue - don't process any more
  requestQueue.length = 0;

  const message = `Spotify rate limit hit. Requests paused for ${Math.ceil(cooldownMs / 1000)} seconds.`;
  console.warn(`Circuit breaker opened: ${message}`);
  notifyRateLimitError(message);
}

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
 * Authenticated Spotify Fetch with Rate Limiting + Circuit Breaker
 * - Limits concurrent requests to MAX_CONCURRENT_REQUESTS
 * - Deduplicates identical concurrent requests
 * - Opens circuit breaker on 429 to block ALL requests
 */
export async function spotifyFetch<T = any>(
  endpoint: string,
  fetchOptions: RequestInit = {}
): Promise<T> {
  // Circuit breaker check - block immediately if rate limited
  if (isRateLimited()) {
    const waitTime = Math.ceil((circuitOpenUntil - Date.now()) / 1000);
    throw new Error(`Spotify rate limited. Please wait ${waitTime} seconds.`);
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `https://api.spotify.com/v1/${endpoint}`;

  // Request deduplication - if same URL is already in flight, wait for that result
  const cacheKey = `${fetchOptions.method || 'GET'}:${url}`;
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  const executeRequest = async (): Promise<T> => {
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

      // Handle rate limiting - OPEN CIRCUIT BREAKER to block all requests
      if (res.status === 429) {
        releaseSlot();
        const retryAfter = parseInt(res.headers.get('Retry-After') || '30', 10);
        openCircuitBreaker(retryAfter);
        throw new Error(`Spotify rate limited. Please wait ${retryAfter} seconds.`);
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
      throw error;
    }
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
