# Changelog

## 2025-11-16

### Fixed
- **Spotify Token Loading Issue:**
  - Added `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env` and `supabase/.env.local` to provide necessary credentials for the Supabase Edge Function.
  - Updated `supabase/functions/spotify-token/index.ts` to include `apikey` in `Access-Control-Allow-Headers` to resolve CORS policy blocking issues.
