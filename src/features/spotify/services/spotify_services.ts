import { spotifyFetch, getSpotifyToken } from './spotifyConnection';

// ============================================
// Search Functions
// ============================================

export async function searchTracks(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`
  )
  return {
    items: data?.tracks?.items ?? [],
    total: data?.tracks?.total ?? 0
  };
}

export async function searchAlbums(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=album&limit=${limit}&offset=${offset}`
  )
  return {
    items: data?.albums?.items ?? [],
    total: data?.albums?.total ?? 0
  };
}

export async function searchArtists(query: string, limit: number = 10, offset: number = 0) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&offset=${offset}`
  )
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
  )
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
  }
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
 */
/**
 * Get multiple tracks at once (batch request)
 * Handles chunking to respect Spotify's 50 ID limit
 */
export async function getMultipleTracks(trackIds: string[]) {
  if (!trackIds.length) return { tracks: [] };

  // Spotify limit: 50 IDs per request
  const chunks = [];
  for (let i = 0; i < trackIds.length; i += 50) {
    chunks.push(trackIds.slice(i, i + 50));
  }

  const results = await Promise.all(chunks.map(async chunk => {
    const ids = chunk.join(',');
    return await spotifyFetch(`tracks?ids=${ids}`);
  }));

  // Merge results
  const allTracks = results.reduce((acc, curr) => {
    return [...acc, ...(curr?.tracks || [])];
  }, []);

  return { tracks: allTracks };
}

/**
 * Get multiple albums at once (batch request)
 * Handles chunking to respect Spotify's 20 ID limit
 */
export async function getMultipleAlbums(albumIds: string[]) {
  if (!albumIds.length) return { albums: [] };

  // Spotify limit: 20 IDs per request
  const chunks = [];
  for (let i = 0; i < albumIds.length; i += 20) {
    chunks.push(albumIds.slice(i, i + 20));
  }

  const results = await Promise.all(chunks.map(async chunk => {
    const ids = chunk.join(',');
    return await spotifyFetch(`albums?ids=${ids}`);
  }));

  // Merge results
  const allAlbums = results.reduce((acc, curr) => {
    return [...acc, ...(curr?.albums || [])];
  }, []);

  return { albums: allAlbums };
}

/**
 * Get a single album (alias for getAlbumDetails)
 */
export async function getAlbum(albumId: string) {
  return await getAlbumDetails(albumId)
}

/**
 * Get tracks for an album
 */
export async function getAlbumTracks(albumId: string) {
  // Use cache for full album object? No, this is the tracks endpoint.
  // URL: albums/{id}/tracks
  // Currently difficult to cache paginated results reliably without a dedicated 'album_tracks_cache'.
  // We will leave this uncached for now or cache page 1?
  // Let's stick to API for tracks listing to ensure freshness.
  const data = await spotifyFetch(`albums/${albumId}/tracks`);
  return data;
}


// ============================================
// Playlist Management Functions (NEW)
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
  const token = await getSpotifyToken()

  // FIX: Use the correct Spotify API endpoint: https://api.spotify.com/v1/users/{user_id}/playlists
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
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Spotify Create Playlist Error ${response.status}: ${error.error?.message || response.statusText}`
    )
  }

  return await response.json()
}

/**
 * Add tracks to an existing Spotify playlist.
 * Requires playlist-modify-public or playlist-modify-private scope.
 */
export async function addTracksToSpotifyPlaylist(
  playlistId: string,
  trackUris: string[] // Array of Spotify URIs (e.g., spotify:track:ID)
) {
  const token = await getSpotifyToken()

  // FIX: Use the correct Spotify API endpoint: https://api.spotify.com/v1/playlists/{playlist_id}/tracks
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
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Spotify Add Tracks Error ${response.status}: ${error.error?.message || response.statusText}`
    )
  }

  return await response.json()
}

// ============================================
// Helper/Utility Functions
// ============================================

/**
 * Get the 30-second preview URL for a track
 * Returns null if no preview is available
 */
export async function getTrackPreview(trackId: string): Promise<string | null> {
  const track = await getTrackDetails(trackId)
  return track.preview_url
}

/**
 * Generate a direct link to open the resource in Spotify app/web
 */
export function generateSpotifyLink(
  resourceId: string,
  type: 'track' | 'album' | 'artist' | 'playlist'
): string {
  return `https://open.spotify.com/${type}/${resourceId}`
}

/**
 * Extract Spotify ID from various URL formats
 * Handles: open.spotify.com URLs, spotify: URIs, or plain IDs
 */
export function extractSpotifyId(input: string): string | null {
  // Plain ID
  if (/^[a-zA-Z0-9]{22}$/.test(input)) {
    return input
  }

  // Spotify URI: spotify:track:xxxxx
  const uriMatch = input.match(/spotify:(track|album|artist|playlist):([a-zA-Z0-9]{22})/)
  if (uriMatch) {
    return uriMatch[2]
  }

  // URL: https://open.spotify.com/track/xxxxx
  const urlMatch = input.match(/open\.spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]{22})/)
  if (urlMatch) {
    return urlMatch[2]
  }

  return null
}

/**
 * Format duration from milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

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
  formatDuration
};


