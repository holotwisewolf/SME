import { spotifyFetch, getSpotifyToken } from './spotifyConnection';
import { supabase } from '../../../lib/supabaseClient';

// ============================================
// Cache Helper Functions
// ============================================

const CACHE_TTL_HOURS = 24;

async function getCachedItems(ids: string[], type: 'track' | 'album' | 'artist'): Promise<Map<string, any>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from('spotify_cache')
    .select('resource_id, data')
    .eq('resource_type', type)
    .in('resource_id', ids)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.warn('Cache read error:', error.message);
    return new Map();
  }

  const map = new Map<string, any>();
  data?.forEach(row => map.set(row.resource_id, row.data));
  return map;
}

async function cacheItems(items: any[], type: 'track' | 'album' | 'artist'): Promise<void> {
  if (items.length === 0) return;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  const rows = items.filter(Boolean).map(item => ({
    resource_id: item.id,
    resource_type: type,
    data: item,
    expires_at: expiresAt.toISOString()
  }));

  // Use upsert to update existing or insert new
  const { error } = await supabase
    .from('spotify_cache')
    .upsert(rows, { onConflict: 'resource_id' });

  if (error) {
    console.warn('Cache write error:', error.message);
  }
}

// ============================================
// Search Functions
// ============================================

export async function searchTracks(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`
  );
  return {
    items: data?.tracks?.items ?? [],
    total: data?.tracks?.total ?? 0
  };
}

export async function searchAlbums(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=album&limit=${limit}&offset=${offset}`
  );
  return {
    items: data?.albums?.items ?? [],
    total: data?.albums?.total ?? 0
  };
}

export async function searchArtists(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&offset=${offset}`
  );
  return {
    items: data?.artists?.items ?? [],
    total: data?.artists?.total ?? 0
  };
}

/**
 * Universal search across tracks, albums, and artists
 */
export async function searchAll(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=${limit}&offset=${offset}`
  );
  return {
    tracks: {
      items: data?.tracks?.items ?? [],
      total: data?.tracks?.total ?? 0
    },
    albums: {
      items: data?.albums?.items ?? [],
      total: data?.albums?.total ?? 0
    },
    artists: {
      items: data?.artists?.items ?? [],
      total: data?.artists?.total ?? 0
    },
  };
}

// ============================================
// Details Functions
// ============================================

export async function getAlbumDetails(albumId: string) {
  const data = await spotifyFetch(`albums/${albumId}`);
  return data;
}

export async function getTrackDetails(trackId: string) {
  const data = await spotifyFetch(`tracks/${trackId}`);
  return data;
}

export async function getArtistDetails(artistId: string) {
  const data = await spotifyFetch(`artists/${artistId}`);
  return data;
}

/**
 * Get multiple tracks at once (batch request)
 * Uses cache-first strategy to minimize API calls
 */
export async function getMultipleTracks(trackIds: string[]) {
  if (!trackIds.length) return { tracks: [] };

  // 1. Check cache first
  const cachedMap = await getCachedItems(trackIds, 'track');
  const cachedTracks: any[] = [];
  const uncachedIds: string[] = [];

  for (const id of trackIds) {
    if (cachedMap.has(id)) {
      cachedTracks.push(cachedMap.get(id));
    } else {
      uncachedIds.push(id);
    }
  }

  // 2. Fetch only uncached tracks from Spotify API
  let fetchedTracks: any[] = [];
  if (uncachedIds.length > 0) {
    // Spotify limit: 50 IDs per request
    const chunks = [];
    for (let i = 0; i < uncachedIds.length; i += 50) {
      chunks.push(uncachedIds.slice(i, i + 50));
    }

    const results = await Promise.all(chunks.map(async chunk => {
      const ids = chunk.join(',');
      return await spotifyFetch(`tracks?ids=${ids}`);
    }));

    fetchedTracks = results.reduce((acc, curr) => {
      return [...acc, ...(curr?.tracks || [])];
    }, []);

    // 3. Cache the newly fetched tracks
    await cacheItems(fetchedTracks, 'track');
  }

  // 4. Merge and return in original order
  const allTracksMap = new Map<string, any>();
  cachedTracks.forEach(t => t && allTracksMap.set(t.id, t));
  fetchedTracks.forEach(t => t && allTracksMap.set(t.id, t));

  const orderedTracks = trackIds.map(id => allTracksMap.get(id)).filter(Boolean);
  return { tracks: orderedTracks };
}

/**
 * Get multiple albums at once (batch request)
 * Uses cache-first strategy to minimize API calls
 */
export async function getMultipleAlbums(albumIds: string[]) {
  if (!albumIds.length) return { albums: [] };

  // 1. Check cache first
  const cachedMap = await getCachedItems(albumIds, 'album');
  const cachedAlbums: any[] = [];
  const uncachedIds: string[] = [];

  for (const id of albumIds) {
    if (cachedMap.has(id)) {
      cachedAlbums.push(cachedMap.get(id));
    } else {
      uncachedIds.push(id);
    }
  }

  // 2. Fetch only uncached albums from Spotify API
  let fetchedAlbums: any[] = [];
  if (uncachedIds.length > 0) {
    // Spotify limit: 20 IDs per request
    const chunks = [];
    for (let i = 0; i < uncachedIds.length; i += 20) {
      chunks.push(uncachedIds.slice(i, i + 20));
    }

    const results = await Promise.all(chunks.map(async chunk => {
      const ids = chunk.join(',');
      return await spotifyFetch(`albums?ids=${ids}`);
    }));

    fetchedAlbums = results.reduce((acc, curr) => {
      return [...acc, ...(curr?.albums || [])];
    }, []);

    // 3. Cache the newly fetched albums
    await cacheItems(fetchedAlbums, 'album');
  }

  // 4. Merge and return in original order
  const allAlbumsMap = new Map<string, any>();
  cachedAlbums.forEach(a => a && allAlbumsMap.set(a.id, a));
  fetchedAlbums.forEach(a => a && allAlbumsMap.set(a.id, a));

  const orderedAlbums = albumIds.map(id => allAlbumsMap.get(id)).filter(Boolean);
  return { albums: orderedAlbums };
}

/**
 * Get a single album (alias for getAlbumDetails)
 */
export async function getAlbum(albumId: string) {
  return await getAlbumDetails(albumId);
}

/**
 * Get tracks for an album
 */
export async function getAlbumTracks(albumId: string) {
  const data = await spotifyFetch(`albums/${albumId}/tracks`);
  return data;
}


// ============================================
// Playlist Management Functions
// ============================================

/**
 * Create a Spotify playlist for the user.
 * Requires playlist-modify-public or playlist-modify-private scope.
 */
export async function createSpotifyPlaylist(
  userId: string,
  name: string,
  description: string,
  isPublic: boolean
) {
  const token = await getSpotifyToken();

  // FIX: Updated to correct Spotify API endpoint
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify Create Playlist Error ${response.status}: ${error.error?.message || response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Add tracks to an existing Spotify playlist.
 * Requires playlist-modify-public or playlist-modify-private scope.
 */
export async function addTracksToSpotifyPlaylist(
  playlistId: string,
  trackUris: string[] // Array of Spotify URIs (e.g., spotify:track:ID)
) {
  const token = await getSpotifyToken();

  // FIX: Updated to correct Spotify API endpoint
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify Add Tracks Error ${response.status}: ${error.error?.message || response.statusText}`
    );
  }

  return await response.json();
}

// ============================================
// Helper/Utility Functions
// ============================================

/**
 * Get the 30-second preview URL for a track
 * Returns null if no preview is available
 */
export async function getTrackPreview(trackId: string): Promise<string | null> {
  const track = await getTrackDetails(trackId);
  return track.preview_url;
}

/**
 * Generate a direct link to open the resource in Spotify app/web
 */
export function generateSpotifyLink(
  resourceId: string,
  type: 'track' | 'album' | 'artist' | 'playlist'
): string {
  // FIX: Updated to standard open.spotify.com URL
  return `https://open.spotify.com/${type}/${resourceId}`;
}

/**
 * Extract Spotify ID from various URL formats
 * Handles: open.spotify.com URLs, spotify: URIs, or plain IDs
 */
export function extractSpotifyId(input: string): string | null {
  // Plain ID
  if (/^[a-zA-Z0-9]{22}$/.test(input)) {
    return input;
  }

  // Spotify URI: spotify:track:xxxxx
  const uriMatch = input.match(/spotify:(track|album|artist|playlist):([a-zA-Z0-9]{22})/);
  if (uriMatch) {
    return uriMatch[2];
  }

  // URL: https://open.spotify.com/track/xxxxx
  const urlMatch = input.match(/open\.spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]{22})/);
  if (urlMatch) {
    return urlMatch[2];
  }

  return null;
}

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const logoutSpotify = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_token_timestamp');
  localStorage.removeItem('spotify_verifier');

  console.log('Spotify tokens cleared from local storage');
};

export const SpotifyService = {
  searchTracks,
  searchAlbums,
  searchArtists,
  searchAll,
  getAlbumDetails,
  getTrackDetails,
  getArtistDetails,
  getMultipleTracks,
  getMultipleAlbums,
  getAlbum,
  getAlbumTracks,
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
  getTrackPreview,
  generateSpotifyLink,
  extractSpotifyId,
  formatDuration,
  logoutSpotify
};