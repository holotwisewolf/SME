// src/services/spotifyService.ts
import { spotifyFetch } from '../lib/spotifyConnection'

/**
 * Spotify Service
 * High-level business logic and helper functions
 */

// ============================================
// Search Functions
// ============================================

export async function searchTracks(query: string, limit: number = 10) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
  )
  return data.tracks
}

export async function searchAlbums(query: string, limit: number = 10) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`
  )
  return data.albums
}

export async function searchArtists(query: string, limit: number = 10) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`
  )
  return data.artists
}

/**
 * Universal search across tracks, albums, and artists
 */
export async function searchAll(query: string, limit: number = 10) {
  const data = await spotifyFetch(
    `search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=${limit}`
  )
  return {
    tracks: data.tracks,
    albums: data.albums,
    artists: data.artists,
  }
}

// ============================================
// Details Functions
// ============================================

export async function getAlbumDetails(albumId: string) {
  return await spotifyFetch(`albums/${albumId}`)
}

export async function getTrackDetails(trackId: string) {
  return await spotifyFetch(`tracks/${trackId}`)
}

export async function getArtistDetails(artistId: string) {
  return await spotifyFetch(`artists/${artistId}`)
}

/**
 * Get multiple tracks at once (batch request)
 */
export async function getMultipleTracks(trackIds: string[]) {
  const ids = trackIds.join(',')
  return await spotifyFetch(`tracks?ids=${ids}`)
}

/**
 * Get multiple albums at once (batch request)
 */
export async function getMultipleAlbums(albumIds: string[]) {
  const ids = albumIds.join(',')
  return await spotifyFetch(`albums?ids=${ids}`)
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