import { supabase } from '../../../lib/supabaseClient';

/**
 * Initiates the Spotify OAuth flow.
 * Redirects the user to Spotify to sign in.
 */
export async function signInWithSpotify() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      scopes: 'user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read user-top-read',
      redirectTo: window.location.origin + '/setup-profile',
    }
  });

  if (error) throw error;
  return data;
}