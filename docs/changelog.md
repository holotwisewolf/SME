# Changelog

## 2025-11-16

### Fixed
- **Spotify Token Loading Issue:**
  - Added `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env` and `supabase/.env.local` to provide necessary credentials for the Supabase Edge Function.
  - Updated `supabase/functions/spotify-token/index.ts` to include `apikey` in `Access-Control-Allow-Headers` to resolve CORS policy blocking issues.

## 2025-11-22(Junqi)

### Progress
  **src/services/spotify_services.ts**
  -Added
  export async function searchTracks(query, filters) { ... }
  export async function searchAlbums(query, filters) { ... }
  export async function searchArtists(query) { ... }
  export async function getAlbumDetails(albumId) { ... }
  export async function getTrackDetails(trackId) { ... }
  export async function getArtistDetails(artistId) { ... }
  export async function getTrackPreview(trackId) { ... }
  export function generateSpotifyLink(resourceId, type) { ... }
  export async function getClientCredentialsToken() { ... }

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

### 2025-11-23(Eric)

### Progress
- **Spotify Services**
  Added extra spotify services
  - export async function createSpotifyPlaylist(userId, name, desc, isPublic) { ... }
  - export async function addTracksToSpotifyPlaylist(playlistId, trackUris) { ... }

### 2025-11-25(Junqi)

### progress
	
  **/src/components/TaggingModal.tsx**
  -pop a window for user to add tags
	-getAllTags() // Fetches all available tags from the database, sorted alphabetically.
	-getPreMadeTags() // Fetches only system-defined tags (where type is 'premade').
	-getUserCustomTags() // Fetches only 'custom' tags created by the currently logged-in user.
	-createTag(tagName, type) // Creates a new tag in the database (defaults to 'custom' type) and links it to the current user.
	-assignTagToItem(itemId, itemType, tagId) // Links a specific tag to a Spotify item (track, album, or playlist).
	-removeTagFromItem(itemId, itemType, tagId) // Removes (unlinks) a specific tag from a Spotify item.
	-getItemTags(itemId, itemType) // Retrieves all tags currently assigned to a specific item ID.
	-searchTags(query) // Performs a search to find existing tags that match the query string.
	
  **/src/services/spotify_tag.ts**
	- createTag(tagName, type) // type: pre-made or custom
	- assignTagToItem(itemId, itemType, tagId) // itemType: track, album, playlist
	- removeTagFromItem(itemId, itemType, tagId)
	- getItemTags(itemId, itemType)
	- searchTags(query)
	- getPreMadeTags()
	- getUserCustomTags(userId)
	- deleteTag(tagId)