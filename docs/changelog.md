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

### 2025-11-26(SF)

### Progress

  - **/src/features/comment/services/comment_services.ts**
    Create a new comment folder in `../src/feature`
    - export async function createComment(...)
    - export async function updateComment(...)
    - export async function deleteComment(...)
    - export async function getComment(...)
    - export async function getItemComments(...)
    - export async function getUserComments(...)
    - export async function getCommentReplies(...)
    - export async function getCommentWithRating(...)
    - export async function getCommentCount(...)
    - export function subscribeToComments(...)
    - export function unsubscribeFromComments(...)

  - **supabase**
    Have modify to the comment with YJ

  - **app.ts** 
    Added some needed
    - export type Comment = Database['public']['Tables']['comments']['Row'];

    - export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

    - export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

### 2025-11-30(SF)

### Porgress

  - **src/features/spotify/components/AlbumDetailModal**
    Create a new comment folder in `../src/spotify`
    - export function AlbumDetailModal({ album, onClose }: AlbumDetailModalProps) {...}
  
  - **src/features/spotify/components/AlbumsFullPage.tsx**
    added onclick on image,notion logo,import AlbumDetailModal
    - Ctrl + F search /* added onclick on the album img */
    - search /*notion logo YJ can modified*/
    - search /* Album Detail Modal */



### 2025-12-11(Matthew)
### Fixed
- **UI Layout (Add Track Modal):**
  - Modified `src/features/spotify/components/SpotifyResultItem.tsx` to accept a `className` prop for custom styling.
  - Updated `src/features/playlists/components/AddTrackModal.tsx` to apply right padding (`pr-24`) to result items. This prevents the "Add" button from overlapping with the track duration and text.

- **Playlist Auto-Refresh & Auth Loading:**
  - Modified `src/features/playlists/components/PlaylistDashboard.tsx`: Added `supabase.auth.onAuthStateChange` listener to automatically load playlists immediately upon login or session restore.
  - Modified `PlaylistCard.tsx` & `AddTrackModal.tsx`: Implemented a callback mechanism (`onTrackAdded` and `refreshTrigger`) to immediately reload the playlist track list after a new song is added.


## 2025-12-17(matthew)

### Fixed
- **Spotify API Rate Limiting (429 Errors)**
  - Modified `src/features/playlists/services/playlist_services.ts`
  - Implemented in-memory caching (`spotifyCache`) and staggered requests to prevent hitting Spotify API limits when loading multiple playlist cards.
- **Data Synchronization & Optimistic Updates**
  - Fixed issue where Tags, Ratings, and Comments didn't update sorting order immediately.
  - Implemented `onPlaylistUpdate` and `onTagsUpdate` callbacks to sync child components (`ExpandedPlaylistCard`, `PlaylistReview`) with `PlaylistDashboard` instantly.
- **UI Layout & Types**
  - Fixed `AddTrackModal` button overlap issue by adding padding to result items.
  - Fixed TypeScript errors regarding `FilterState` exports and `item_id` typing in Realtime payloads.

### Progress
- **Advanced Filtering & Sorting System**
  - **src/components/ui/FilterDropdown.tsx**
    - Redesigned UI: Replaced green theme with `#FFD1D1` accent color.
    - Added **Rating Slider**: 0-5 range with specific number input.
    - Added **Multi-select Tags**: Support for selecting multiple tags to filter.
    - Added **Global vs Personal Toggles**: Separate logic for filtering by "My Ratings/Tags" vs "Global Ratings/Tags".
  
  - **src/features/playlists/components/PlaylistDashboard.tsx**
    - Implemented **Frontend Data Aggregation**: Fetches and calculates `rating_avg`, `comment_count`, and `tag_count` in parallel.
    - Implemented **Supabase Realtime**: Dashboard now listens for database changes (ratings/comments) from other users and auto-refreshes stats.
    - Added complex sorting logic (e.g., Sort by "Recently Commented", "Highest Personal Rating", "Most Tags").
