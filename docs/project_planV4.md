# Spotify Music Explorer - Development Plan

## Project Overview

Spotify Music Explorer is a web application that enhances Spotify users' music discovery, organization, and interaction through advanced playlist management, rating systems, and community-driven recommendations.

**Timeline:** 6 Weeks  
**Team Structure:** 2 Teams (2 people each) + 1 Team Leader  
**Total Team Size:** 5 people

---

## Part 1: Feature Design Breakdown

### Phase 1 Features (MVP - No OAuth)

**1. Authentication & User Management**
- Email/password registration and login via Supabase
- User profile creation and management
- Privacy settings for rating visibility
- Session management

**2. Spotify Integration (Client Credentials)**
- Search tracks, albums, artists using Spotify API
- Fetch track metadata and album details
- 30-second audio preview playback
- Direct Spotify link generation

**3. Rating System**
- Personal ratings (1-10 scale) - stored locally per user
- Public/global ratings - aggregated from all users
- Privacy toggle (make ratings public/private)
- Real-time rating updates via Supabase subscriptions
- Rating history tracking
- **Can rate: tracks, albums, AND playlists**

**4. Tagging System**
- Pre-made tags/categories (genres, moods, vibes)
- Custom user-created tags
- Tag assignment to tracks, albums, and playlists
- Tag filtering and search (for user's own content and community content)

**5. Playlist Management**
- Create custom playlists within app
- Add/remove tracks and albums
- Add/remove tags to playlists
- Drag-and-drop reordering
- Playlist metadata (title, description, color)
- Search within playlists
- Filter and sort playlists by tags, ratings, date

**6. Favorites/Likes**
- Like/unlike tracks
- Favorites collection page
- Quick access to liked tracks
- Filter favorites by tags, ratings

**7. Discovery & Recommendations**
- **Trending Section**  
  Community-driven rankings powered by user activity.  
  Content can be sorted by:
    - Top rated (highest average score)
    - Most ratings (highest rating count)
    - Most commented
    - Most recently commented
    - Most newly tagged
  Users can apply time filters (7 days, 30 days, all-time) and content filters  
  (tags, Spotify genres, rating thresholds, activity recency).

- **Community Discovery Dashboard**  
  A unified page showing:
    - Recently rated or commented content
    - Trending tags and genres
    - Filterable community lists (tags, genres, rating thresholds, time periods)
    - Sorting options (top rated, most commented, activity-based)

- **For You Page**: Personalized recommendations using graph-based engine
  - Graph nodes: tracks, albums, artists, genres, tags
  - Graph edges: related artist, related genres, same genre, same artist, same album, user ratings, user tags, user favorites
  - Displays recommended tracks/albums on a dedicated page
  - Algorithm traverses graph to find similar content based on user preferences

**8. Search & Filtering**
- **Spotify Search**: Global search for tracks/albums/artists from Spotify (basic filters like genre from Spotify API)
- **User Content Filtering**: Filter and search within user's own playlists, favorites, and rated content by tags, ratings, date
- **Community Content Filtering**: Filter community-rated playlists/tracks/albums by tags, ratings, time period

**9. Community Features**
- View global ratings and statistics
- Community comments on tracks/albums/playlists
- Community-rated playlists/tracks/albums sections
- Filterable by various criteria (genre, rating, tags, time)

**10. Real-time Updates**
- Live global rating updates
- Real-time playlist changes
- Supabase real-time subscriptions

### Phase 2 Features (Optional - With Supabase OAuth)

**1. Spotify OAuth Integration via Supabase**
- Enable Spotify as auth provider in Supabase Dashboard
- Use `supabase.auth.signInWithOAuth({ provider: 'spotify' })`
- Link Spotify to existing accounts with `supabase.auth.linkIdentity()`
- Secure token storage handled automatically by Supabase
- Access Spotify tokens from `user.identities`

**2. Playlist Export to Spotify**
- Export custom playlists to user's Spotify account
- Create playlist on Spotify using Spotify API
- Add tracks to exported playlist
- Sync playlist metadata (title, description)
- Requires Spotify OAuth connection

**3. Enhanced Spotify Features (Requires OAuth)**
- Access user's Spotify library
- Sync user's existing Spotify playlists (optional)
- Import listening history for better recommendations
- Access user's followed artists

**4. Enhanced Features (Very Extra Bonus)**
- AI-powered tag suggestions (GPT-4o)
- AI-generated playlist names
- Lyric generation/display
- Enhanced recommendation explanations

---

## Part 2: Functions & Modules List

### **Frontend Modules (React + TypeScript)**

#### **A. Authentication Module**
- `register()`
- `login()`
- `logout()`
- `resetPassword()`
- `verifyEmail()`
- `updateProfile()`
- `getSession()`
- `checkAuthStatus()`
- **Phase 2:**
  - `linkSpotifyAccount()` // Links Spotify to existing account
  - `unlinkSpotifyAccount()` // Removes Spotify connection
  - `checkSpotifyLinked()` // Checks if user has Spotify connected
  - `getSpotifyAccessToken()` // Retrieves Spotify token from user.identities

#### **B. Spotify API Module**
- `searchTracks(query, spotifyFilters)` // spotifyFilters = genre, year from Spotify API
- `searchAlbums(query, spotifyFilters)`
- `searchArtists(query)`
- `getAlbumDetails(albumId)`
- `getTrackDetails(trackId)`
- `getArtistDetails(artistId)`
- `getTrackPreview(trackId)`
- `generateSpotifyLink(resourceId, type)`
- `getClientCredentialsToken()`
- **Phase 2:**
  - `createSpotifyPlaylist(userId, name, description, isPublic)` // Requires OAuth
  - `addTracksToSpotifyPlaylist(playlistId, trackUris)` // Requires OAuth
  - `getUserSpotifyPlaylists()` // Optional: Import user's playlists
  - `getUserSpotifyLibrary()` // Optional: Access user's library

#### **C. Rating Module**
- `submitPersonalRating(itemId, itemType, rating, isPublic)` // itemType: track, album, playlist
- `updateRating(ratingId, newRating)`
- `deleteRating(ratingId)`
- `getPersonalRating(itemId, itemType)`
- `getGlobalRating(itemId, itemType)`
- `toggleRatingPrivacy(ratingId)`
- `getRatingHistory(userId)`
- `calculateAverageRating(itemId, itemType)`
- `subscribeToRatingUpdates(itemId, itemType)`

#### **D. Tagging Module**
- `createTag(tagName, type)` // type: pre-made or custom
- `assignTagToItem(itemId, itemType, tagId)` // itemType: track, album, playlist
- `removeTagFromItem(itemId, itemType, tagId)`
- `getItemTags(itemId, itemType)`
- `searchTags(query)`
- `getPreMadeTags()`
- `getUserCustomTags(userId)`
- `deleteTag(tagId)`

#### **E. Comments Module**
##### Core Comment Operations
- `createComment(itemId, itemType, content, parentCommentId?)` 
  - itemType: 'playlist', 'track', 'album', etc.
  - parentCommentId: optional, for replies/nested comments
  - Returns: commentId

- `updateComment(commentId, newContent)`
  - Updates comment content
  - Only by comment owner

- `deleteComment(commentId)`
  - Remove comment from database

- `getComment(commentId)`
  - Fetch single comment with user details

##### Fetching Comments
- `getItemComments(itemId, itemType, options?)`
  - options: { sortBy: 'recent' | 'oldest', limit, offset, includeReplies: true }
  - Returns paginated list of top-level comments with nested replies
  - Include user profile and their rating for the item

- `getUserComments(userId, options?)`
  - Get all comments by a user (both top-level and replies)
  - options: { limit, offset }

- `getCommentReplies(parentCommentId)`
  - Fetch all replies to a specific comment
  - Used for lazy-loading nested replies or "Show more replies"
  - Like show 5 more replies

- `getCommentWithRating(commentId)`
  - Fetch comment + user's rating for that item
  - Shows: "UserX rated 4.5★ and said..."

- `getCommentCount(itemId, itemType)`
  - Total count including replies

##### Real-time Updates
- `subscribeToComments(itemId, itemType, callback)`
  - Real-time updates when new comments added
  - For live comment feed

- `unsubscribeFromComments(itemId, itemType)`

#### **F. Playlist Module**
- `createPlaylist(title, description, color)`
- `deletePlaylist(playlistId)`
- `updatePlaylist(playlistId, updates)`
- `addItemToPlaylist(playlistId, itemId, itemType)` // itemType: track or album
- `removeItemFromPlaylist(playlistId, itemId)`
- `reorderPlaylistItems(playlistId, newOrder)`
- `getUserPlaylists(userId)`
- `getPlaylistDetails(playlistId)`
- `searchWithinPlaylist(playlistId, query)`
- `filterUserPlaylists(userId, filters)` // filters: tags, ratings, date
- `sortPlaylist(playlistId, sortBy)`
- `duplicatePlaylist(playlistId)`
- **Phase 2:**
  - `exportPlaylistToSpotify(playlistId)` // Requires OAuth

#### **G. Favorites Module**
- `likeTrack(trackId)`
- `unlikeTrack(trackId)`
- `getFavorites(userId)`
- `checkIfLiked(trackId)`
- `getFavoritesCount(userId)`
- `filterFavorites(userId, filters)` // filters: tags, ratings

#### **H. Recommendation Module**
- `generatePersonalizedRecommendations(userId)` // For "For You" page using graph traversal
- `buildUserPreferenceGraph(userId)` // Create graph with nodes (tracks/albums/artists/genres/tags) and edges
- `addGraphNode(nodeId, nodeType, metadata)` // Add node to graph (track, album, artist, genre, tag)
- `addGraphEdge(node1, node2, edgeType, weight)` // Add edge (related artist, same genre, user rating, etc.)
- `traverseGraph(startNodes, depth, filters)` // Traverse graph to find recommendations
- `calculateRecommendationScore(userId, itemId, itemType)` // Score based on graph distance and edge weights
- `getRecommendedTracks(userId, limit)`
- `getRecommendedAlbums(userId, limit)`
- `getRelatedArtists(artistId)` // From Spotify API or graph
- `getRelatedGenres(genreId)` // From graph connections

#### **I. Community Module**
- `getCommunityContent(filters, sort, timeRange)` // Universal fetcher for tracks/albums/playlists
- `getCommunityRatedPlaylists(filters, sort, timeRange)`
- `getCommunityRatedTracks(filters, sort, timeRange)`
- `getCommunityRatedAlbums(filters, sort, timeRange)`
- `getRecentCommunityActivity(limit)`
- `getCommunityComments(itemId, itemType)`
- `addComment(itemId, itemType, comment)`
- `deleteComment(commentId)`
- `getGlobalStatistics()`
- `getTrendingTags(timeRange)`
- `getTrendingGenres(timeRange)`
- `getUserActivityStats(userId)` // Total ratings, comments, tags

#### **J. Search & Filter Module**
- `spotifySearch(query, type, spotifyFilters)` // Search Spotify catalog
- `filterUserContent(content, filters)` // Filter user's playlists/favorites by tags/ratings/date
- `sortUserContent(content, sortBy)` // Sort by rating, date added, etc.
- `filterCommunityContent(content, filters)` // Filter by tags/ratings/time/activity age
- `sortCommunityContent(content, sortBy)` // Sort by: top rated, most ratings, most commented, recently commented, newly tagged
- `applyTimeRangeFilter(content, timeRange)` // 7 days, 30 days, all-time
- `applyRatingThresholdFilter(content, minRating)` // Filter by minimum rating
- `applyActivityAgeFilter(content, maxAge)` // Filter by last activity timestamp
- `getPaginatedResults(items, page, limit)`
- `buildFilterQuery(filters)`

#### **K. UI State Management Module**
- `updateUIState(state)`
- `getUIState()`
- `cacheResults(key, data)`
- `getCachedResults(key)`
- `clearCache()`

#### **L. Real-time Module**
- `subscribeToChannel(channel, callback)`
- `unsubscribeFromChannel(channel)`
- `broadcastUpdate(channel, data)`
- `handleRealTimeEvent(event)`

#### **M. Profile Module**
- `getUserProfile(userId)`
- `updatePrivacySettings(settings)`
- `getRatingStatistics(userId)` // tracks, albums, AND playlists
- `getRecentlyRated(userId, limit)`
- `exportUserData(userId)`
- **Phase 2:**
  - `getSpotifyConnectionStatus(userId)` // Check if Spotify is linked

### **Backend Modules (Supabase)**

#### **N. Database Module (Supabase)**
- `initializeDatabase()`
- `executeQuery(query)`
- `executeBatch(queries)`
- `handleTransaction(operations)`
- `setupRLS()`
- `migrateSchema()`

#### **O. Edge Functions Module (Supabase)**
- `generateClientCredentials()`
- `validateRequest()`
- `rateLimitCheck()`
- **Phase 2:**
  - `exportPlaylistToSpotify(playlistId, userId)` // Calls Spotify API with user's OAuth token
  - `syncSpotifyPlaylists(userId)` // Optional: Import user's playlists
  - `refreshSpotifyToken(userId)` // Handle token refresh if needed

#### **P. AI Integration Module (Phase 2 - Bonus)**
- `generateTagSuggestions(trackData)`
- `generatePlaylistName(tracks, tags)`
- `enhanceRecommendationExplanation(recommendationData)`

---

## Part 3: Development Stages & Grouping (6 Weeks)

### **STAGE 1: Foundation & Core Infrastructure** (Week 1)
**Milestone: Basic App Shell Running**

**Team Leader + Team 1: Project Setup & Authentication**
- Project initialization (Vite + React + TypeScript)
- Tailwind CSS configuration
- Supabase setup and configuration
- Database schema design
- Authentication Module (register, login, logout, session management)
- Basic routing setup
- Environment configuration

**Team 2: Spotify Integration Foundation**
- Spotify API client setup
- Client Credentials flow implementation
- Basic search functionality (searchTracks, searchAlbums, searchArtists)
- Track preview integration
- Spotify link generation

**Deliverables:**
- Users can register/login
- Basic search works
- Can preview tracks
- Database is initialized

---

### **STAGE 2: Core Features - Ratings & Tags** (Week 2)
**Milestone: Users Can Rate and Tag Music**

**Team 1: Rating System**
- Personal rating submission and storage (tracks, albums, playlists)
- Global rating aggregation
- Rating privacy toggle
- Rating display components
- Real-time rating updates (Supabase subscriptions)
- Rating history tracking

**Team 2: Tagging System**
- Pre-made tags database seeding
- Custom tag creation
- Tag assignment functionality (tracks, albums, playlists)
- Tag filtering
- Tag management UI

**Team Leader: Integration & Coordination**
- Ensure ratings and tags work together
- Code review and merge coordination

**Deliverables:**
- Users can rate tracks/albums/playlists
- Public/private ratings work
- Global ratings update in real-time
- Tags can be created and assigned

---

### **STAGE 3: Organization Features** (Week 3)
**Milestone: Complete Playlist Management**

**Team 1 + Team Leader: Playlist Core Features**
- Create/delete playlists
- Add/remove tracks and albums
- Playlist detail view
- Playlist metadata editing (title, description, color)
- Add/remove tags to playlists

**Team 2: Playlist Advanced Features & Favorites**
- Drag-and-drop reordering
- Search within playlists
- Filter and sort functionality
- Favorites/likes functionality
- Favorites collection page

**Deliverables:**
- Full playlist CRUD operations
- Playlists can be tagged and rated
- Favorites system works
- Intuitive organization UI

---

### **STAGE 4: Discovery & Recommendations** (Week 4)
**Milestone: Personalized Recommendations Working**

**Team 1: Search & Filtering**
- Spotify search implementation
- User content filtering (playlists/favorites by tags/ratings)
- Community content filtering
- Sort functionality
- Pagination
- Search results optimization

**Team 2 + Team Leader: Recommendation Engine**
- User preference graph building
- Content similarity algorithm
- Hybrid recommendation logic
- Similar albums feature
- Personalized "For You" page
- Recommendation score calculation

**Deliverables:**
- Spotify search fully functional
- User content filtering works (tags, ratings)
- Personalized recommendations appear
- "For You" page populated
- Similar content suggestions work

---

### **STAGE 5: Community Features** (Week 5)
**Milestone: Community Engagement Active**

**Team 1: Trending & Discovery Metrics**
(Community-based; data-driven rankings using Supabase, NOT Spotify charts)

#### **Trending Metrics (Sort Options)**
The community content list can be sorted by:
- **Top rated** (highest average rating score)
- **Most ratings** (highest rating count)
- **Most commented** (highest comment count)
- **Most recently commented** (latest comment timestamp)
- **Most newly tagged** (most recent tag additions)

#### **Time Filters (Define "Trending Period")**
- Weekly Trending (past 7 days)
- Monthly Trending (past 30 days)
- Historical Top Content (all-time)

#### **Content Filters**
- **Tag-Based Filter:** Show only items containing selected tags
- **Genre-Based Filter:** Show items matching selected Spotify genres
- **Rating Threshold Filter:** Only show content above a minimum average rating (e.g., ≥ 7/10)
- **Activity Age Filter:** Filter items by how recently they received their last activity (rating, comment, tag)

**Implementation Tasks:**
- Build trending query logic in Supabase
- Create time-range filters (7d, 30d, all-time)
- Implement sorting algorithms (top rated, most ratings, etc.)
- Build filter UI components
- Display trending tracks/albums/playlists

**Team 2: Community User Actions & Interaction**
- Users can:
  - Rate community tracks/albums/playlists
  - Tag community tracks/albums/playlists (add custom or pre-made tags)
  - Comment on community tracks/albums/playlists
- Public user profile pages with activity statistics:
  - Total ratings given
  - Total comments posted
  - Total tags added
  - Recently rated items
  - Recently commented items

**Team Leader: Integration & Real-time Updates**
- Ensure trending logic works correctly with live rating/tag/comment data
- Connect community actions to trending metrics
- Test real-time updates (Supabase Realtime subscriptions)
- Ensure smooth final UI/UX integration across all community pages
- Optimize database queries for performance

**Deliverables:**
- Fully functional Community & Trending sections
- Real-time rating and comment updates
- Tag/genre-based discovery working
- Multiple sort options (top rated, most commented, etc.)
- Time-range filters (7d, 30d, all-time)
- Public user profiles showing activity stats

---

### **STAGE 6: Polish, Optimization & Phase 2 (If Time)** (Week 6)
**Milestone: Production-Ready Application**

**Team 1: UI/UX Enhancement & Polish**
- Design system refinement
- Responsive design fixes
- Loading states and animations
- Error handling improvements
- Accessibility compliance

**Team 2: Performance Optimization**
- Code optimization
- Database query optimization
- Caching implementation
- Real-time performance tuning

**Team Leader: QA & Phase 2 Preparation**
- Bug fixes
- User testing coordination
- Code review
- **If time: Supabase Spotify OAuth setup**
- **If time: Playlist export implementation**

**Optional Phase 2 (If Time Allows):**

**Supabase Spotify OAuth Integration:**
- Enable Spotify provider in Supabase Dashboard
- Configure OAuth scopes (playlist-modify-public, playlist-modify-private)
- Implement `linkIdentity()` flow in frontend
- Create UI for "Connect Spotify" feature
- Handle OAuth callback and token storage

**Playlist Export Feature:**
- Create Supabase Edge Function for playlist export
- Implement `exportPlaylistToSpotify()` function
- Extract Spotify access token from user.identities
- Call Spotify API to create playlist
- Add tracks to created playlist
- Display success/error feedback

**Optional Bonus (Extra Time):**
- AI features (tag suggestions, playlist naming)
- Import user's existing Spotify playlists
- Sync listening history

**Deliverables:**
- Polished, professional UI
- Fast and responsive
- Production-ready MVP
- ⚠️ Optional: Spotify OAuth connection working
- ⚠️ Optional: Playlist export to Spotify functional
- ⚠️ Optional: AI features active

---

## Major Milestones Summary

| Week | Milestone | Key Deliverables |
|------|-----------|------------------|
| Week 1 | Basic App Shell Running | Auth + Spotify Search + Database Setup |
| Week 2 | Users Can Rate and Tag Music | Rating System (tracks/albums/playlists) + Tagging System |
| Week 3 | Complete Playlist Management | Playlists + Tags + Favorites |
| Week 4 | Personalized Recommendations Working | Search/Filter + Recommendation Engine |
| Week 5 | Community Engagement Active | Trending + Community Features + Comments |
| Week 6 | Production-Ready Application | Polish + Optimization + (Optional Supabase OAuth) |

---

## Technical Stack Summary

### Phase 1 (MVP)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **API:** Spotify Web API (Client Credentials)
- **Hosting:** Vercel / Cloudflare Pages / Netlify

### Phase 2 (Optional)
- **OAuth:** Supabase Spotify Provider (no custom backend needed!)
- **Playlist Export:** Supabase Edge Functions
- **AI:** OpenAI GPT-4o (Bonus)

---

## Database Schema Considerations

### Core Tables
1. **users** - User accounts and profiles (managed by Supabase Auth)
2. **ratings** - Personal and public ratings (tracks, albums, playlists) with timestamps
3. **tags** - Pre-made and custom tags
4. **playlists** - User-created playlists
5. **playlist_items** - Tracks/albums in playlists
6. **item_tags** - Junction table for tagging (tracks, albums, playlists) with timestamps
7. **favorites** - Liked tracks
8. **comments** - Community comments (tracks, albums, playlists) with timestamps
9. **user_preferences** - For recommendation engine (simplified: ratings, tags, favorites)
10. **activity_log** - Track user activity for trending calculations (optional optimization)

### Phase 2 Additions
- **No additional tables needed!** Spotify connection is tracked in `auth.identities` (managed by Supabase)
- Optional: `spotify_sync_status` if implementing playlist import feature

---

## Team Assignment Strategy

### Team Structure (5 People Total)

**Team Leader (You)**
- Project coordination and architecture
- Code review and quality assurance
- Integration work between teams
- Critical feature implementation
- Database design and schema management
- Deployment and DevOps

**Team 1 (2 People)**
- Week 1: Authentication & Database setup
- Week 2: Rating system
- Week 3: Core playlist features
- Week 4: Search & user content filtering/sorting
- Week 5: Trending metrics & discovery (sort/filter logic)
- Week 6: UI/UX polish

**Team 2 (2 People)**
- Week 1: Spotify API integration
- Week 2: Tagging system
- Week 3: Advanced playlist features & favorites
- Week 4: Graph-based recommendation engine (For You page)
- Week 5: Community interaction (rating/tagging/commenting)
- Week 6: Performance optimization

---

## Key Changes from Previous Version

### Major Simplifications in Phase 2
- **No FastAPI backend needed!** Everything handled by Supabase
- **OAuth via Supabase Provider:** Uses `supabase.auth.linkIdentity()` instead of custom OAuth flow
- **Simplified architecture:** Frontend → Supabase Edge Functions → Spotify API
- **Token management:** Automatic via Supabase Auth (stored in `auth.identities`)
- **Playlist export:** Implemented in Supabase Edge Functions, not separate backend

### Phase 2 Implementation Approach
1. Enable Spotify provider in Supabase Dashboard
2. Configure OAuth scopes for playlist creation
3. Use `linkIdentity()` for optional Spotify connection
4. Access tokens via `user.identities[].access_token`
5. Create Edge Function to call Spotify API
6. No separate backend server required!

### Benefits of This Approach
- ✅ Simpler architecture (no FastAPI setup)
- ✅ Unified auth system (Supabase handles everything)
- ✅ Lower infrastructure costs (no additional backend server)
- ✅ Easier deployment (just Edge Functions)
- ✅ Better security (tokens managed by Supabase)
- ✅ Faster Phase 2 implementation (less code to write)

---

## Risk Management

### High Priority Risks
1. **Spotify API Rate Limits** - Implement caching and request optimization
2. **Real-time Performance** - Test Supabase subscriptions at scale
3. **Recommendation Algorithm Complexity** - Graph-based system requires careful design and optimization
4. **Time Constraints** - Prioritize Phase 1, Phase 2 is optional
5. **Small Team Size** - Clear communication and well-defined modules

### Mitigation Strategies
- Daily standups (15 min)
- Weekly code reviews
- Continuous integration testing
- Clear module boundaries
- Buffer time in Week 6 for unexpected issues
- Team Leader handles integration points

---

## Success Criteria

### Phase 1 MVP Success
- Users can search Spotify and preview tracks
- Users can rate tracks, albums, AND playlists (private/public)
- Users can tag tracks, albums, AND playlists
- Playlists work seamlessly with full CRUD operations
- User content is filterable by tags and ratings
- Recommendations are relevant and personalized
- Community features are active (comments, trending)
- Real-time updates work smoothly
- UI is polished and responsive

### Phase 2 Success (Optional)
- Users can link Spotify account to existing account
- Users can export playlists to their Spotify account
- OAuth flow is secure and seamless via Supabase
- AI features enhance user experience (extra bonus)

---

## Notes

- **Phase 2 now uses Supabase OAuth** - No custom backend required!
- **Playlist export via Edge Functions** - Simpler and more secure
- **OAuth is optional linking** - Users don't need Spotify to use the app
- Rating scale is **1-10** for consistency
- Phase 2 features are stretch goals - prioritize Phase 1 completion
- All OAuth-dependent features clearly marked as Phase 2/Optional
- Small team requires excellent communication and clear module boundaries

---

**Last Updated:** [Current Date]  
**Project Duration:** 6 Weeks  
**Target Launch:** End of Week 6  
**Team Size:** 5 (1 Leader + 2 Teams of 2)