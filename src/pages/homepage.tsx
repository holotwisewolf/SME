import { useEffect, useState } from "react";
import { spotifyFetch } from "../lib/spotifyAPI";

// Define Spotify Artist type ----------------------------------------
interface SpotifyArtist {
  id: string;
  name: string;
  images?: { url: string }[];
}

// Define full API response shape -------------------------------------
interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

export default function HomePage() {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = (await spotifyFetch(
          "https://api.spotify.com/v1/search?q=taylor&type=artist"
        )) as SpotifySearchResponse;

        setArtists(data.artists.items);
      } catch (err) {
        console.error("Spotify fetch error:", err);
      }
    }

    load();
  }, []);

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Artists</h1>

      {artists.map((a) => (
        <p key={a.id}>{a.name}</p>
      ))}
    </div>
  );
}
