import { supabase } from '../../../lib/supabaseClient';

/**
 * Initiates the Spotify OAuth flow.
 * Redirects the user to Spotify to sign in.
 */
export async function signInWithSpotify() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      scopes: 'user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read user-top-read playlist-modify-public playlist-modify-private',
      redirectTo: window.location.origin + '/setup-profile',
      
      // FIX: Force Spotify to show the login dialog every time.
      // This allows users to click "Not you?" and switch accounts.
      queryParams: {
        show_dialog: 'true'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Get the user's Spotify access token from the current session.
 * Returns null if not signed in with Spotify.
 */
export async function getSpotifyUserToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.provider_token || null;
}

/**
 * Get the user's Spotify ID by calling the Spotify API.
 * More reliable than parsing identity_data.
 */
export async function getSpotifyUserId(): Promise<string | null> {
  const token = await getSpotifyUserToken();
  if (!token) return null;

  try {
    // Corrected API URL
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return null;

    const userData = await response.json();
    return userData.id || null;
  } catch (error) {
    console.error('Error fetching Spotify user ID:', error);
    return null;
  }
}

/**
 * Check if user is connected to Spotify
 */
export async function isSpotifyConnected(): Promise<boolean> {
  const token = await getSpotifyUserToken();
  return !!token;
}

/**
 * Export a playlist to the user's Spotify account.
 * Creates a new playlist and adds all tracks.
 */
export async function exportPlaylistToSpotify(
  playlistTitle: string,
  playlistDescription: string | null,
  trackIds: string[]
): Promise<{ success: boolean; playlistUrl?: string; error?: string }> {
  try {
    // 1. Get user's Spotify token
    const token = await getSpotifyUserToken();
    if (!token) {
      return { success: false, error: 'Not connected to Spotify. Please sign in with Spotify first.' };
    }

    // 2. Get user's Spotify ID
    const spotifyUserId = await getSpotifyUserId();
    if (!spotifyUserId) {
      return { success: false, error: 'Could not retrieve Spotify user ID.' };
    }

    // 3. Create playlist on Spotify
    // Corrected API URL
    const createResponse = await fetch(`https://api.spotify.com/v1/users/${spotifyUserId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistTitle,
        description: playlistDescription || 'Exported from SME',
        public: false // Default to private
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      return { success: false, error: errorData?.error?.message || 'Failed to create playlist on Spotify' };
    }

    const newPlaylist = await createResponse.json();

    // 4. Add tracks to the playlist (Spotify accepts up to 100 at a time)
    if (trackIds.length > 0) {
      const trackUris = trackIds.map(id => `spotify:track:${id}`);

      // Split into chunks of 100
      for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);

        // Corrected API URL
        const addResponse = await fetch(`https://api.spotify.com/v1/playlists/${newPlaylist.id}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: chunk })
        });

        if (!addResponse.ok) {
          console.error('Failed to add tracks chunk:', await addResponse.json());
        }
      }
    }

    return {
      success: true,
      playlistUrl: newPlaylist.external_urls?.spotify
    };
  } catch (error) {
    console.error('Error exporting to Spotify:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}