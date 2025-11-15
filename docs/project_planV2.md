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
- **Trending Section**: Top-rated tracks/albums/playlists by time period (7 days, 30 days, all-time)
- **Community Dashboard**: Recently rated content, filterable by tags/genres/ratings
- **For You Page**: Personalized recommendations using hybrid graph-based engine
  - Uses: user ratings, tags, related artist, related albums, related genres, same artist, same album, same genres

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

### Phase 2 Features (Optional - With OAuth)

**1. Spotify OAuth Integration**
- Authorization Code Flow via FastAPI backend
- Secure token storage in Supabase
- User authorization flow

**2. Playlist Export**
- Export custom playlists to Spotify account
- Create playlist on user's Spotify
- Add tracks to exported playlist
- Sync playlist metadata

**3. Enhanced Features (Very Extra Bonus)**
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

#### **E. Playlist Module**
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

#### **F. Favorites Module**
- `likeTrack(trackId)`
- `unlikeTrack(trackId)`
- `getFavorites(userId)`
- `checkIfLiked(trackId)`
- `getFavoritesCount(userId)`
- `filterFavorites(userId, filters)` // filters: tags, ratings

#### **G. Recommendation Module**
- `generatePersonalizedRecommendations(userId)`
- `getSimilarAlbums(albumId)`
- `getTrendingTracks(timeRange, filters)`
- `getTrendingAlbums(timeRange, filters)`
- `getTrendingPlaylists(timeRange, filters)`
- `calculateRecommendationScore(userId, itemId, itemType)`
- `buildUserPreferenceGraph(userId)`
- `getContentSimilarity(itemId1, itemId2)`

#### **H. Community Module**
- `getCommunityRatedPlaylists(filters, sort)` // filters: tags, ratings, time
- `getCommunityRatedTracks(filters, sort)`
- `getCommunityRatedAlbums(filters, sort)`
- `getRecentCommunityActivity(limit)`
- `getCommunityComments(itemId, itemType)` // itemType: track, album, playlist
- `addComment(itemId, itemType, comment)`
- `deleteComment(commentId)`
- `getGlobalStatistics()`

#### **I. Search & Filter Module**
- `spotifySearch(query, type, spotifyFilters)` // Search Spotify catalog
- `filterUserContent(content, filters)` // Filter user's playlists/favorites by tags/ratings
- `filterCommunityContent(content, filters)` // Filter community content by tags/ratings/time
- `sortResults(items, sortBy, order)`
- `getPaginatedResults(items, page, limit)`
- `buildFilterQuery(filters)`

#### **J. UI State Management Module**
- `updateUIState(state)`
- `getUIState()`
- `cacheResults(key, data)`
- `getCachedResults(key)`
- `clearCache()`

#### **K. Real-time Module**
- `subscribeToChannel(channel, callback)`
- `unsubscribeFromChannel(channel)`
- `broadcastUpdate(channel, data)`
- `handleRealTimeEvent(event)`

#### **L. Profile Module**
- `getUserProfile(userId)`
- `updatePrivacySettings(settings)`
- `getRatingStatistics(userId)` // tracks, albums, AND playlists
- `getRecentlyRated(userId, limit)`
- `exportUserData(userId)`

### **Backend Modules (Supabase + Optional FastAPI)**

#### **M. Database Module (Supabase)**
- `initializeDatabase()`
- `executeQuery(query)`
- `executeBatch(queries)`
- `handleTransaction(operations)`
- `setupRLS()`
- `migrateSchema()`

#### **N. Edge Functions Module (Supabase)**
- `generateClientCredentials()`
- `refreshSpotifyToken()`
- `validateRequest()`
- `rateLimitCheck()`

#### **O. OAuth Module (Phase 2 - FastAPI)**
- `initiateSpotifyAuth()`
- `handleAuthCallback(code)`
- `exchangeCodeForTokens(code)`
- `refreshAccessToken(refreshToken)`
- `storeTokens(userId, tokens)`
- `revokeAccess(userId)`

#### **P. Playlist Export Module (Phase 2 - FastAPI)**
- `createSpotifyPlaylist(userId, playlistData)`
- `addTracksToSpotifyPlaylist(playlistId, trackIds)`
- `syncPlaylistMetadata(playlistId, metadata)`
- `validateSpotifyConnection(userId)`

#### **Q. AI Integration Module (Phase 2 - Bonus)**
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

**Team 1: Trending & Discovery**
- Trending tracks/albums/playlists
- Time-based filtering (7 days, 30 days, all-time)
- Tag-based trending
- Genre-specific trending
- Community statistics dashboard

**Team 2: Community Interaction**
- Community comments system (tracks, albums, playlists)
- Community-rated content sections
- Recent activity feed
- Global rating insights
- Community profile features

**Team Leader: Integration**
- Ensure trending and community features work together
- Performance optimization

**Deliverables:**
- Trending sections populated
- Community features active
- Comments working
- Activity feed live

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
- If time: FastAPI setup for Phase 2
- If time: OAuth flow implementation

**Optional (If Time Allows):**
- Spotify OAuth integration
- Playlist export functionality
- AI features (bonus)

**Deliverables:**
- Polished, professional UI
- Fast and responsive
- Production-ready MVP
- |⚠️| [Optional: Playlist export working]
- |⚠️| [Optional: AI features active]

---

## Major Milestones Summary

| Week | Milestone | Key Deliverables |
|------|-----------|------------------|
| Week 1 | Basic App Shell Running | Auth + Spotify Search + Database Setup |
| Week 2 | Users Can Rate and Tag Music | Rating System (tracks/albums/playlists) + Tagging System |
| Week 3 | Complete Playlist Management | Playlists + Tags + Favorites |
| Week 4 | Personalized Recommendations Working | Search/Filter + Recommendation Engine |
| Week 5 | Community Engagement Active | Trending + Community Features + Comments |
| Week 6 | Production-Ready Application | Polish + Optimization + (Optional Phase 2) |

---

## Technical Stack Summary

### Phase 1 (MVP)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **API:** Spotify Web API (Client Credentials)
- **Hosting:** Vercel / Cloudflare Pages / Netlify

### Phase 2 (Optional)
- **Additional Backend:** FastAPI (Python) on Railway/Render
- **OAuth:** Spotify Authorization Code Flow
- **AI:** OpenAI GPT-4o (Bonus)

---

## Database Schema Considerations

### Core Tables
1. **users** - User accounts and profiles
2. **ratings** - Personal and public ratings (tracks, albums, playlists)
3. **tags** - Pre-made and custom tags
4. **playlists** - User-created playlists
5. **playlist_items** - Tracks/albums in playlists
6. **item_tags** - Junction table for tagging (tracks, albums, playlists)
7. **favorites** - Liked tracks
8. **comments** - Community comments (tracks, albums, playlists)
9. **user_preferences** - For recommendation engine

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
- Week 4: Search & filtering
- Week 5: Trending & discovery
- Week 6: UI/UX polish

**Team 2 (2 People)**
- Week 1: Spotify API integration
- Week 2: Tagging system
- Week 3: Advanced playlist features & favorites
- Week 4: Recommendation engine
- Week 5: Community interaction
- Week 6: Performance optimization

---

## Key Changes from Original Plan

### Modified Features
- Playlist rating capability added (users can now rate playlists)
- Tagging system expanded to include playlists
- Clarified search: Spotify search is separate from user/community content filtering
- User content filtering: Filter user's own playlists/favorites by tags, ratings, date
- Community content filtering: Filter community content by tags, ratings, time period

### Clarifications
- **Spotify Search**: Basic search using Spotify API (genre, year filters from Spotify)
- **User Content Filtering**: Advanced filtering for user's own playlists and favorites (tags, ratings, date)
- **Community Content Filtering**: Advanced filtering for community-rated content (tags, ratings, time)

---

## Risk Management

### High Priority Risks
1. **Spotify API Rate Limits** - Implement caching and request optimization
2. **Real-time Performance** - Test Supabase subscriptions at scale
3. **Recommendation Algorithm Complexity** - Start simple, iterate
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
- Users can export playlists to Spotify
- OAuth flow is secure and seamless
- AI features enhance user experience (extra bonus)

---

## Notes

- **Folders feature removed** as requested
- **Playlist rating added** - users can now rate playlists just like tracks and albums
- **Search clarified**: Spotify search vs. user/community content filtering
- Rating scale is **1-10** for consistency
- Phase 2 features are stretch goals - prioritize Phase 1 completion
- All OAuth-dependent features clearly marked as Phase 2/Optional
- Small team requires excellent communication and clear module boundaries

---

**Last Updated:** [Current Date]  
**Project Duration:** 6 Weeks  
**Target Launch:** End of Week 6  
**Team Size:** 5 (1 Leader + 2 Teams of 2)