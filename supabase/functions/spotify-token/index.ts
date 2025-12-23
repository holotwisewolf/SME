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
      console.error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars");
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

    console.log("Requesting new Spotify token...");
    const spotifyRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!spotifyRes.ok) {
      const errorText = await spotifyRes.text();
      console.error(`Spotify API Error [${spotifyRes.status}]: ${errorText}`);
      return new Response(JSON.stringify({ error: `Spotify API failed`, details: errorText }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    const data = await spotifyRes.json();

    if (!data.access_token || !data.expires_in) {
      console.error("Invalid Spotify Token Response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid response from Spotify" }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    // Cache
    cachedToken = data;
    cachedExpiresAt = Date.now() + (data.expires_in * 1000);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (err) {
    console.error("Spotify Token Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
