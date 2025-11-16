// /src/lib/spotifyApi.ts

export async function getToken() {
  const res = await fetch(
    "https://febxarbnucisgyxnttfk.supabase.co/functions/v1/spotify-token"
  );

  if (!res.ok) {
    throw new Error("Failed to get Spotify token");
  }

  return res.json() as Promise<{ access_token: string }>;
}

export async function spotifyFetch(url: string) {
  const { access_token } = await getToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify API Error ${res.status}`);
  }

  return res.json();
}
