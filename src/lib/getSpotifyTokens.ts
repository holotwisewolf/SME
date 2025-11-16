import { supabase } from "./supabase";

export async function getSpotifyTokens() {
  const { data, error } = await supabase.functions.invoke('spotify-token');

  if (error) {
    throw new Error(`Failed to invoke function: ${error.message}`);
  }

  return data;
}