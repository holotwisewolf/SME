import { supabase } from '../lib/supabaseClient'; 
import { spotifyFetch, clearSpotifyToken } from '../lib/spotifyConnection';

/**
 * Links the current logged-in user to their Spotify account.
 * * Usage: Call this after the user successfully logs in with Spotify
 * or clicks a "Connect Spotify" button.
 */
export async function linkSpotifyAccount() {
  // A. Get the current logged-in user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error('No user is currently logged in.');
  }

  try {
    // B. Fetch the user's Spotify Profile to get their Spotify ID
    // We use spotifyFetch which handles the tokens for us
    const spotifyProfile = await spotifyFetch('me'); 

    // C. Update the 'profiles' table in your database
    const { data, error: updateError } = await supabase
      .from('profiles') //
      .update({
        spotify_connected: true,
        spotify_user_id: spotifyProfile.id, // e.g., 'spotify_user_123'
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id) // Match the profile to the current user
      .select()
      .single();

    if (updateError) throw updateError;
    
    return data;
  } catch (err) {
    console.error('Error linking Spotify account:', err);
    throw err;
  }
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