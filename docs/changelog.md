# Changelog

## 2025-11-16

### Fixed
- **Spotify Token Loading Issue:**
  - Added `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env` and `supabase/.env.local` to provide necessary credentials for the Supabase Edge Function.
  - Updated `supabase/functions/spotify-token/index.ts` to include `apikey` in `Access-Control-Allow-Headers` to resolve CORS policy blocking issues.

## 2025-11-21  (YJ)

### Fixed
- **Supabase Cloud Database**
  - Updated `/types/supabase.ts` to match cloud database.
  - Added scripts in `package.json` to update database easily:
      - Log into supabase CLI and run: "npm run types"
  - Removed duplicative `src/supabaseClient.ts`, kept the main one in `lib/supabseClient.ts`.
  - Added error validatiosn for `lib/supabaseClient.ts`.
  - Combined `lib/spotifyAPI.ts` and `lib/getSpotifyToken.ts` into `lib/spotifyConnection.ts`

## 2025-11-22(Junqi)

### Progress
- **Spotify Services**
  `src/services/spotify_services.ts`
  Added helper functions:
  - export async function searchTracks(query, filters) { ... }
  - export async function searchAlbums(query, filters) { ... }
  - export async function searchArtists(query) { ... }
  - export async function getAlbumDetails(albumId) { ... }
  - export async function getTrackDetails(trackId) { ... }
  - export async function getArtistDetails(artistId) { ... }
  - export async function getTrackPreview(trackId) { ... }
  - export function generateSpotifyLink(resourceId, type) { ... }

## 2025-11-22(Matthew)

### Progress
- **Authentication Services**
  Added necessary authentication services in `src/services/auth_services.ts`

### 2025-11-23(SF)

### Progress
- **Authentication Services**
  Added necessary authentication services in
  `src/services/spotify_auth.ts`
  - export async function linkSpotifyAccount() { ... }
  - export async function unlinkSpotifyAccount() { ... }
