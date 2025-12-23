// src/services/auth_services.ts

// Import the initialized Supabase client
import { supabase } from '../../../lib/supabaseClient';
import type { IAuthService } from '../contracts/auth_contracts';

const DEV_INVITE = import.meta.env.VITE_DEV_INVITE || '';

/**
 * Registers a new user.
 * Usage: Call this when the user submits the sign-up form.
 * Logic: Creates a user in Supabase Auth and passes metadata (username).
 * This relies on a Database Trigger to create a corresponding row in the 'profiles' table.
 * @param data - Object containing { email, password, username, inviteCode }
 */
export async function register(data: any) {
  const { email, password, username, inviteCode } = data;

  // Determine role based on code match
  // Ensure DEV_INVITE is actually set to avoid security holes with empty strings
  const isDev = DEV_INVITE && inviteCode && inviteCode === DEV_INVITE;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass extra metadata to allow the Postgres Trigger to populate the 'profiles' table
      data: {
        username: username,
        display_name: username, // Set default display name same as username
        app_role: isDev ? 'dev' : 'user', // Set app_role based on invite code
      }
    }
  });

  if (error) throw error;
  return authData;
}

/**
 * Logs in an existing user.
 * Usage: Call this when the user submits the login form.
 * Logic: Authenticates using email/password. Supports Username login by looking up the email first.
 * @param data - Object containing { email, password, remember }
 */
export async function login(data: any) {
  let { email, password } = data; // 'remember' is handled by Supabase client config

  // Check if input is an email
  const isEmail = email.includes('@');

  if (!isEmail) {
    // Treat as username and lookup email
    // NOTE: This requires the 'profiles' table to be readable (RLS Policy) for the email column
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', email)
      .single();

    if (profileError || !profile) {
      throw new Error("Username not found or invalid.");
    }

    email = profile.email;
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
 * Usage: Call this when the user clicks the "Logout" button.
 * Logic: Invalidates the Supabase session and clears local storage.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Initiates the password reset process.
 * Usage: Call this from the "Forgot Password" page.
 * Logic: Sends an email to the user with a magic link to reset their password.
 * @param email - The user's email address.
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
 * Usage: Call this if you are handling manual 6-digit code verification.
 * @param token - The 6-digit token or hash.
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
 * Usage: Call this from the Settings/Profile page.
 * Logic: Updates the public 'profiles' table in the database.
 * @param userId - The UUID of the user to update.
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
 * Usage: Call this to get the Access Token (JWT) for making authenticated API requests.
 * @returns The session object or null if no session exists.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Checks if the user is currently authenticated.
 * Usage: Call this on app load or in route guards.
 * @returns true if logged in, false otherwise.
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
  // Use Date.now() for better uniqueness than Math.random()
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true // Overwrite if exists to save space
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Deletes a user avatar from the 'avatars' bucket.
 * @param avatarUrl - The full public URL of the avatar to delete.
 */
export async function deleteAvatar(avatarUrl: string) {
  try {
    // Extract the file path from the public URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/avatars/{userId}/{filename}
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');

    // Find 'avatars' in the path and get everything after it
    const avatarsIndex = pathParts.indexOf('avatars');
    if (avatarsIndex === -1) {
      // Fail silently or log warning if URL isn't from our bucket
      console.warn('Invalid avatar URL format, skipping deletion');
      return;
    }

    const filePath = pathParts.slice(avatarsIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    // Don't throw - we don't want to block the user flow if deletion fails
  }
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
 * Updates the user's username.
 * Logic: Updates both Auth Metadata AND the public 'profiles' table to ensure consistency.
 * @param username - The new username.
 * @param displayName - Optional display name.
 */
export async function updateUsername(username: string, displayName?: string) {
  const dataToUpdate: any = { username };
  if (displayName) {
    dataToUpdate.display_name = displayName;
  }

  // 1. Update Supabase Auth User Metadata
  const { data, error } = await supabase.auth.updateUser({
    data: dataToUpdate
  });

  if (error) throw error;

  // 2. Update Public Profiles table explicitly
  // (In case the database trigger only handles INSERTs, not UPDATEs)
  if (data.user) {
    await updateProfile(data.user.id, {
      username: username,
      ...(displayName && { display_name: displayName })
    });
  }

  return data;
}

/**
 * Updates the user's Auth Metadata (stored in auth.users).
 * This is CRITICAL for RLS policies that check auth.jwt() ->> 'app_role'.
 * @param metadata - Object containing metadata fields to update (e.g. { app_role: 'dev' })
 */
export async function updateAuthMetadata(metadata: any) {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });

  if (error) throw error;
  return data;
}

/**
 * Validates an invite code for developer access.
 * @param code - The invite code to check.
 */
export async function validateInviteCode(code: string) {
  return !!DEV_INVITE && code === DEV_INVITE;
}

export const AuthService: IAuthService = {
  register,
  login,
  logout,
  resetPassword,
  verifyEmail,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getProfile,
  updatePassword,
  updateUsername,
  updateAuthMetadata,
  validateInviteCode,
  getSession,
  checkAuthStatus
};