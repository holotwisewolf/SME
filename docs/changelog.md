# Changelog

## 2025-11-16

### Fixed
- **Spotify Token Loading Issue:**
  - Added `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env` and `supabase/.env.local` to provide necessary credentials for the Supabase Edge Function.
  - Updated `supabase/functions/spotify-token/index.ts` to include `apikey` in `Access-Control-Allow-Headers` to resolve CORS policy blocking issues.

## 2025-11-21  

### Fixed
- **Supabase Cloud Database**
  - Updated `/types/supabase.ts` to match cloud database.
  - Added scripts in `package.json` to update database easily:
      - Log into supabase CLI and run: "npm run types"
  - Removed duplicative `src/supabaseClient.ts`, kept the main one in `lib/supabseClient.ts`.
  - Added error validatiosn for `lib/supabseClient.ts`.