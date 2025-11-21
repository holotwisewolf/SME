// src/services/auth_services.ts

// Import the initialized Supabase client
import { supabase } from '../lib/supabaseClient'; 

/**
 * Checks if a username is available.
 * Uses ilike for case-insensitive checking.
 * * @param username - The username to check
 * @returns true if available, false if taken
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username) // Case-insensitive match
    .maybeSingle();
  
  if (error) throw error;
  return data === null; // Available if no match found
}

/**
 * Registers a new user with username validation.
 * * Usage: Call this when the user submits the sign-up form.
 * Logic: Creates a user in Supabase Auth and passes metadata (username) 
 * which should be handled by a Database Trigger to create a row in the 'profiles' table.
 * * @param data - Object containing { email, password, username }
 */
export async function register(data: any) {
  const { email, password, username } = data;
  
  // Validate username is available before attempting signup
  const isAvailable = await checkUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Username already taken');
  }
  
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass extra metadata to allow the Postgres Trigger to populate the 'profiles' table
      data: {
        username: username, 
        display_name: username, // Set default display name same as username
      }
    }
  });

  if (error) throw error;
  return authData;
}

/**
 * Logs in an existing user.
 * * Usage: Call this when the user submits the login form.
 * Logic: Authenticates using email/password and establishes a session (JWT).
 * * @param data - Object containing { email, password }
 */
export async function login(data: any) {
  const { email, password } = data;

  const { data: session, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return session;
}

/**
 * Logs out the current user.
 * * Usage: Call this when the user clicks the "Logout" button.
 * Logic: Invalidates the local session and clears tokens from local storage.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Initiates the password reset process.
 * * Usage: Call this from the "Forgot Password" page.
 * Logic: Sends an email to the user with a magic link to reset their password.
 * * @param email - The user's email address.
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Redirect the user to this URL after they click the email link
    redirectTo: window.location.origin + '/update-password', 
  });

  if (error) throw error;
}

/**
 * Verifies an email address or OTP (One-Time Password).
 * * Usage: Call this if you are handling manual 6-digit code verification.
 * Note: Standard email links usually handle this automatically.
 * * @param token - The 6-digit token or hash.
 * @param email - The user's email address.
 */
export async function verifyEmail(token: string, email: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup' // Verify type: 'signup', 'recovery', etc.
  });

  if (error) throw error;
  return data;
}

/**
 * Updates user profile details.
 * * Usage: Call this from the Settings/Profile page.
 * Logic: Updates the public 'profiles' table in the database, NOT the auth user object.
 * * @param userId - The UUID of the user to update.
 * @param updates - Object containing fields to update (e.g., { bio: 'Hi', avatar_url: '...' })
 */
export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles') // Target the 'profiles' table defined in our ERD
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Retrieves the current active session.
 * * Usage: Call this to get the Access Token (JWT) for making authenticated API requests.
 * @returns The session object or null if no session exists.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Checks if the user is currently authenticated.
 * * Usage: Call this on app load or in route guards to determine if the user 
 * should see the Login page or the Home page.
 * * @returns true if logged in, false otherwise.
 */
export async function checkAuthStatus() {
  const { data } = await supabase.auth.getSession();
  // Convert the session object to a boolean (true if session exists, false if null)
  return !!data.session; 
}