import "jsr:@supabase/functions-js/edge-runtime.d.ts";

let cachedToken = null;
let cachedExpiresAt = 0;

Deno.serve(async () => {
  try {
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return jsonError("Missing Spotify credentials", 500);
    }

    // If we have a cached token and it's still valid → reuse it
    if (cachedToken && cachedExpiresAt > Date.now()) {
      return jsonResponse(cachedToken);
    }

    // Request new token
    const basic = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      return jsonError(`Spotify API error: ${response.status}`, response.status);
    }

    const data = await response.json();

    // Cache for reuse — expires_in is usually 3600 seconds (1 hr)
    cachedToken = data;
    cachedExpiresAt = Date.now() + data.expires_in * 1000;

    return jsonResponse(data);
  } catch (err) {
    return jsonError("Server error: " + err.message, 500);
  }
});

function jsonResponse(body: any) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
