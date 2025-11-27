/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Cache
let cachedToken: any = null;
let cachedExpiresAt = 0;

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  // MAIN FUNCTION LOGIC
  try {
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Missing Spotify credentials" }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    // return cached token if valid
    if (cachedToken && cachedExpiresAt > Date.now()) {
      return new Response(JSON.stringify(cachedToken), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // Request token
    const basic = btoa(`${clientId}:${clientSecret}`);

    const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await spotifyRes.json();

    // Cache
    cachedToken = data;
    cachedExpiresAt = Date.now() + (data.expires_in * 1000);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
