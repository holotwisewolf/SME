// src/services/auth_services.ts

// Import the initialized Supabase client
// NOTE: Adjust this path if your supabase client is located elsewhere (e.g., '../lib/supabase')
import { supabase } from '../lib/supabaseClient';
import type { IAuthService } from '../contracts/auth_contracts';

/**
 * Registers a new user.
 * * Usage: Call this when the user submits the sign-up form.
 * Logic: Creates a user in Supabase Auth and passes metadata (username) 
 * which should be handled by a Database Trigger to create a row in the 'profiles' table.
 * * @param data - Object containing { email, password, username }
 */
export async function register(data: any) {
  const { email, password, username } = data;

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
  let { email, password } = data;

  // Check if input is an email
  const isEmail = email.includes('@');

  if (!isEmail) {
    // Treat as username and lookup email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email') // NOTE: This requires 'email' column in 'profiles' table
      .eq('username', email)
      .single();

    if (profileError || !profile) {
      throw new Error("Username not found");
    }

    email = (profile as any).email;
  }

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

/**
 * Uploads a user avatar to the 'avatars' bucket.
 * @param file - The image file to upload.
 * @param userId - The user's ID (used for file naming).
 * @returns The public URL of the uploaded image.
 */
export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Fetches the user's profile data from the 'profiles' table.
 * @param userId - The UUID of the user.
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates the authenticated user's password.
 * @param password - The new password.
 */
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Updates the user's username (stored in user_metadata).
 * @param username - The new username.
 */
export async function updateUsername(username: string) {
  const { data, error } = await supabase.auth.updateUser({
    data: { username }
  });

  if (error) throw error;
  return data;
}

/**
 * Validates an invite code for developer access.
 * Logic: Checks a 'codes' table or uses a hardcoded check for now.
 * @param code - The invite code to check.
 */
export async function validateInviteCode(code: string) {
  // Mock validation for now, or replace with DB query:
  // const { data } = await supabase.from('invite_codes').select('*').eq('code', code).single();
  // return !!data;

  // Simple mock:
  return code === "DEV-1234";
}

export const AuthService: IAuthService = {
  register,
  login,
  logout,
  resetPassword,
  verifyEmail,
  updateProfile,
  uploadAvatar,
  getProfile,
  updatePassword,
  updateUsername,
  validateInviteCode,
  getSession,
  checkAuthStatus
};
