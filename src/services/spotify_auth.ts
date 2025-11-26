import { supabase } from '../lib/supabaseClient';
import { spotifyFetch, clearSpotifyToken } from '../lib/spotifyConnection';

/**
 * Links the current logged-in user to their Spotify account.
 * * Usage: Call this after the user successfully logs in with Spotify
 * or clicks a "Connect Spotify" button.
 */
export async function linkSpotifyAccount() {
  // Trigger the OAuth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      scopes: 'user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read user-top-read', // Add necessary scopes
      redirectTo: window.location.origin + '/profile', // Redirect back to profile or a callback page
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Unlinks the Spotify account.
 * * Usage: Call this when the user clicks "Disconnect Spotify" in settings.
 */
export async function unlinkSpotifyAccount() {
  // A. Get the current logged-in user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('No user is currently logged in.');
  }

  // B. Clear the local Spotify token so the app stops trying to use it
  clearSpotifyToken(); //

  // C. Update the 'profiles' table to remove connection details
  const { data, error: updateError } = await supabase
    .from('profiles') //
    .update({
      spotify_connected: false,
      spotify_user_id: null, // Remove the Spotify ID
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return data;
}