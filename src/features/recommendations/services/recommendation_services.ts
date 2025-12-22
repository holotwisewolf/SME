// Recommendation services - core logic for For You page

import { supabase } from '../../../lib/supabaseClient';
import {
    getMultipleTracks,
    getMultipleAlbums,
    getArtistDetails,
    getArtistAlbums
} from '../../spotify/services/spotify_services';
import { spotifyFetch } from '../../spotify/services/spotifyConnection';
import type {
    UserPreferences,
    RecommendedItem,
    CandidateItem,
    ScoringWeights,
    RecommendationReason
} from '../types/recommendation_types';
import { DEFAULT_SCORING_WEIGHTS, SCORING_CONSTANTS } from '../types/recommendation_types';
import type { ItemType } from '../../../types/global';

// ============================================
// Genre Similarity Helpers
// ============================================

/**
 * Check if two genres are similar (word overlap or substring match)
 * E.g., "k-pop" is similar to "pop", "korean pop", "j-pop"
 */
function genresAreSimilar(genre1: string, genre2: string): boolean {
    if (genre1 === genre2) return false; // Exact match handled separately

    const g1 = genre1.toLowerCase().replace(/-/g, ' ').trim();
    const g2 = genre2.toLowerCase().replace(/-/g, ' ').trim();

    // Check for substring match
    if (g1.includes(g2) || g2.includes(g1)) return true;

    // Check for word overlap (at least one significant word matches)
    const words1 = g1.split(/\s+/).filter(w => w.length > 2);
    const words2 = g2.split(/\s+/).filter(w => w.length > 2);

    for (const word of words1) {
        if (words2.includes(word)) return true;
    }

    // Check for prefix/suffix similarity (e.g., "electro" and "electronic")
    for (const w1 of words1) {
        for (const w2 of words2) {
            if (w1.length >= 4 && w2.length >= 4) {
                if (w1.startsWith(w2.slice(0, 4)) || w2.startsWith(w1.slice(0, 4))) {
                    return true;
                }
            }
        }
    }

    return false;
}

// ============================================
// User Preferences Collection
// ============================================

/**
 * Get the current user's average personal rating
 */
export async function getUserAverageRating(userId: string): Promise<number> {
    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', userId);

    if (error || !data || data.length === 0) return 5; // Default to middle rating

    const total = data.reduce((acc, curr) => acc + curr.rating, 0);
    return total / data.length;
}

/**
 * Get user's ratings grouped by artist
 */
async function getArtistRatings(userId: string): Promise<Map<string, number>> {
    const artistRatings = new Map<string, number>();

    // Get all user's track ratings
    const { data: ratings, error } = await supabase
        .from('ratings')
        .select('item_id, item_type, rating')
        .eq('user_id', userId)
        .in('item_type', ['track', 'album']);

    if (error || !ratings) return artistRatings;

    // Group ratings by item type for batch fetching
    const trackIds = ratings.filter(r => r.item_type === 'track').map(r => r.item_id);
    const albumIds = ratings.filter(r => r.item_type === 'album').map(r => r.item_id);

    // Fetch Spotify data to get artist info
    const [tracksData, albumsData] = await Promise.all([
        trackIds.length > 0 ? getMultipleTracks(trackIds.slice(0, 50)) : { tracks: [] },
        albumIds.length > 0 ? getMultipleAlbums(albumIds.slice(0, 50)) : { albums: [] }
    ]);

    // Create maps for quick lookup
    const trackMap = new Map(tracksData.tracks?.map((t: any) => [t.id, t]) || []);
    const albumMap = new Map(albumsData.albums?.map((a: any) => [a.id, a]) || []);

    // Calculate average rating per artist
    const artistRatingsSum = new Map<string, { sum: number; count: number }>();

    for (const rating of ratings) {
        let artistId: string | undefined;

        if (rating.item_type === 'track') {
            const track = trackMap.get(rating.item_id);
            artistId = track?.artists?.[0]?.id;
        } else if (rating.item_type === 'album') {
            const album = albumMap.get(rating.item_id);
            artistId = album?.artists?.[0]?.id;
        }

        if (artistId) {
            const current = artistRatingsSum.get(artistId) || { sum: 0, count: 0 };
            artistRatingsSum.set(artistId, {
                sum: current.sum + rating.rating,
                count: current.count + 1
            });
        }
    }

    // Convert to averages
    for (const [artistId, data] of artistRatingsSum) {
        artistRatings.set(artistId, data.sum / data.count);
    }

    return artistRatings;
}

/**
 * Collect all user preferences from their activity
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
    // Fetch user's favorites
    const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('item_id, item_type, created_at')
        .eq('user_id', userId)
        .in('item_type', ['track', 'album'])
        .order('created_at', { ascending: false })
        .limit(100);

    if (favError) {
        console.error('Error fetching favorites:', favError);
    }

    // Fetch user's ratings
    const { data: ratings, error: ratingError } = await supabase
        .from('ratings')
        .select('item_id, item_type, rating')
        .eq('user_id', userId);

    if (ratingError) {
        console.error('Error fetching ratings:', ratingError);
    }

    // Fetch user's tags
    const { data: userTags, error: tagError } = await supabase
        .from('item_tags')
        .select('tags(name)')
        .eq('user_id', userId);

    if (tagError) {
        console.error('Error fetching tags:', tagError);
    }

    // Calculate average rating
    const avgRating = await getUserAverageRating(userId);

    // Get artist-specific ratings
    const artistRatings = await getArtistRatings(userId);

    // Collect artist IDs from favorites
    const trackFavIds = (favorites || []).filter(f => f.item_type === 'track').map(f => f.item_id).slice(0, 50);
    const albumFavIds = (favorites || []).filter(f => f.item_type === 'album').map(f => f.item_id).slice(0, 50);

    console.log('[For You Debug] Favorites found:', {
        trackCount: trackFavIds.length,
        albumCount: albumFavIds.length,
        trackIds: trackFavIds.slice(0, 3) // First 3 for debug
    });

    const [tracksData, albumsData] = await Promise.all([
        trackFavIds.length > 0 ? getMultipleTracks(trackFavIds) : { tracks: [] },
        albumFavIds.length > 0 ? getMultipleAlbums(albumFavIds) : { albums: [] }
    ]);

    console.log('[For You Debug] Spotify data fetched:', {
        tracksReturned: tracksData.tracks?.length || 0,
        albumsReturned: albumsData.albums?.length || 0
    });

    // Extract unique artist IDs
    const artistIds = new Set<string>();
    const genreWeights = new Map<string, number>();
    const genreRatings = new Map<string, { sum: number; count: number }>();

    // Process tracks
    for (const track of tracksData.tracks || []) {
        if (track?.artists?.[0]?.id) {
            artistIds.add(track.artists[0].id);
        }
    }

    // Process albums and extract genres
    for (const album of albumsData.albums || []) {
        if (album?.artists?.[0]?.id) {
            artistIds.add(album.artists[0].id);
        }
        // Albums have genres
        for (const genre of album?.genres || []) {
            genreWeights.set(genre, (genreWeights.get(genre) || 0) + 1);
        }
    }

    console.log('[For You Debug] Artist IDs extracted:', artistIds.size);

    // Fetch artist details to get genres
    const artistIdArray = Array.from(artistIds).slice(0, 20);
    for (const artistId of artistIdArray) {
        try {
            const artist = await getArtistDetails(artistId);
            for (const genre of artist?.genres || []) {
                genreWeights.set(genre, (genreWeights.get(genre) || 0) + 1);
            }
        } catch (e) {
            // Skip if artist fetch fails
        }
    }

    // Get high-rated items (above user's average)
    const highRatedItems = (ratings || [])
        .filter(r => r.rating > avgRating)
        .map(r => ({
            itemId: r.item_id,
            itemType: r.item_type as ItemType,
            rating: r.rating
        }));

    // Extract unique tag names
    const tagNames = new Set<string>();
    for (const tag of userTags || []) {
        if ((tag as any).tags?.name) {
            tagNames.add((tag as any).tags.name);
        }
    }

    // NEW: Calculate artist track counts (tracks rated above avg per artist)
    const artistTrackCounts = new Map<string, number>();
    const trackMap = new Map((tracksData.tracks || []).map((t: any) => [t.id, t]));

    for (const rating of (ratings || []).filter(r => r.item_type === 'track' && r.rating > avgRating)) {
        const track = trackMap.get(rating.item_id);
        const artistId = track?.artists?.[0]?.id;
        if (artistId) {
            artistTrackCounts.set(artistId, (artistTrackCounts.get(artistId) || 0) + 1);
        }
    }

    // NEW: User's personal track ratings
    const userTrackRatings = new Map<string, number>();
    for (const rating of (ratings || []).filter(r => r.item_type === 'track')) {
        userTrackRatings.set(rating.item_id, rating.rating);
    }

    return {
        artistIds: Array.from(artistIds),
        genreWeights,
        userTags: Array.from(tagNames),
        highRatedItems,
        averageRating: avgRating,
        artistRatings,
        genreRatings: new Map(),
        artistTrackCounts,
        userTrackRatings
    };
}

// ============================================
// Spotify API - Related Artists
// ============================================

// SEPARATE caches for different endpoints - related-artists failing doesn't mean top-tracks will fail
const failedRelatedArtistsIds = new Set<string>();
const failedTopTracksIds = new Set<string>();

/**
 * Get related artists from Spotify API
 * Silently handles 404s (artist not found) to avoid console spam
 */
export async function getRelatedArtists(artistId: string): Promise<any[]> {
    // Skip if we already know this endpoint fails for this artist
    if (failedRelatedArtistsIds.has(artistId)) return [];

    try {
        const data = await spotifyFetch(`artists/${artistId}/related-artists`);
        return data?.artists || [];
    } catch (error: any) {
        // Silently handle 404s - related-artists endpoint often fails for regional/indie artists
        if (error?.message?.includes('404')) {
            failedRelatedArtistsIds.add(artistId);
            return [];
        }
        console.warn('Unexpected error fetching related artists:', artistId);
        return [];
    }
}

/**
 * Get artist's top tracks from Spotify API
 * Silently handles 404s (artist not found)
 */
export async function getArtistTopTracks(artistId: string, market: string = 'US'): Promise<any[]> {
    // Use SEPARATE cache - top-tracks often works when related-artists doesn't
    if (failedTopTracksIds.has(artistId)) return [];

    try {
        const data = await spotifyFetch(`artists/${artistId}/top-tracks?market=${market}`);
        return data?.tracks || [];
    } catch (error: any) {
        if (error?.message?.includes('404')) {
            failedTopTracksIds.add(artistId);
            return [];
        }
        console.warn('Unexpected error fetching artist top tracks:', artistId);
        return [];
    }
}

// ============================================
// Candidate Pool Building
// ============================================

/**
 * Build a pool of candidate items for recommendations
 * Enhanced with fallback when related artists API fails
 */
export async function buildCandidatePool(
    preferences: UserPreferences,
    existingFavoriteIds: Set<string>
): Promise<CandidateItem[]> {
    const candidates: CandidateItem[] = [];
    const seenIds = new Set<string>();

    // 1. Get top tracks from favorite artists' related artists
    const topArtists = preferences.artistIds.slice(0, 5);
    let relatedArtistCount = 0;

    console.log('[For You Debug] Building candidate pool for', topArtists.length, 'artists');

    for (const artistId of topArtists) {
        // Get related artists
        const relatedArtists = await getRelatedArtists(artistId);
        relatedArtistCount += relatedArtists.length;

        // Take top 3 related artists per favorite artist
        for (const related of relatedArtists.slice(0, 3)) {
            const topTracks = await getArtistTopTracks(related.id);

            for (const track of topTracks.slice(0, 5)) {
                if (seenIds.has(track.id) || existingFavoriteIds.has(track.id)) continue;
                seenIds.add(track.id);

                candidates.push({
                    id: track.id,
                    type: 'track',
                    name: track.name,
                    artistId: related.id,
                    artistName: related.name,
                    imageUrl: track.album?.images?.[0]?.url || '',
                    genres: related.genres || [],
                    previewUrl: track.preview_url,
                    sourceArtistId: artistId,
                    sourceType: 'related_artist'
                });
            }
        }

        // Also get more tracks from the favorite artist themselves
        // Increase limit when related artists fails (the API returns 404 for some regions)
        const trackLimit = relatedArtists.length === 0 ? 10 : 5;
        const artistTopTracks = await getArtistTopTracks(artistId);
        const artistDetails = await getArtistDetails(artistId);

        for (const track of artistTopTracks.slice(0, trackLimit)) {
            if (seenIds.has(track.id) || existingFavoriteIds.has(track.id)) continue;
            seenIds.add(track.id);

            candidates.push({
                id: track.id,
                type: 'track',
                name: track.name,
                artistId: artistId,
                artistName: artistDetails?.name || track.artists?.[0]?.name || 'Unknown',
                imageUrl: track.album?.images?.[0]?.url || '',
                genres: artistDetails?.genres || [],
                previewUrl: track.preview_url,
                sourceType: 'favorite_artist'
            });
        }
    }

    console.log('[For You Debug] Candidate pool built:', {
        totalCandidates: candidates.length,
        relatedArtistsFound: relatedArtistCount,
        existingFavorites: existingFavoriteIds.size
    });

    return candidates;
}

/**
 * Calculate recommendation score for a candidate item using new balanced algorithm
 * 
 * Algorithm steps:
 * 1. Artist boost: +25 if user rated 2+ tracks from this artist above avg
 * 2. Match bonuses: +50 each for same_artist (rated ≥4), related_artist, genre_match
 * 3. Community rating: rating * 10
 * 4. User rating: rating * 15 (if exists)
 * 5. Diversity penalty: -15 per repeated artist (applied later in batch)
 * 6. Randomness: ±5 for discovery
 */
export function scoreCandidate(
    candidate: CandidateItem,
    preferences: UserPreferences,
    communityAvgRating: number = 0,
    artistAppearances: number = 0 // For diversity penalty
): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const { BASE_SCORE, ARTIST_BOOST, DIVERSITY_PENALTY, COMMUNITY_WEIGHT, USER_RATING_WEIGHT, RANDOM_VARIANCE } = SCORING_CONSTANTS;
    const userAvg = preferences.averageRating;

    // Step 1: Artist boost - Check if user rated 2+ tracks from this artist above avg
    const artistTrackCount = preferences.artistTrackCounts.get(candidate.artistId) || 0;
    if (artistTrackCount >= 2) {
        score += ARTIST_BOOST;
        reasons.push({
            type: 'highly_rated_artist',
            label: `You love this artist (${artistTrackCount} highly rated tracks)`,
            contribution: ARTIST_BOOST
        });
    }

    // Step 2: Match bonuses (equal base scores)

    // 2a. Same artist bonus - only if user rated this artist ≥4
    const artistRating = preferences.artistRatings.get(candidate.artistId) || 0;
    if (artistRating >= 4) {
        score += BASE_SCORE;
        reasons.push({
            type: 'same_artist',
            label: `From artist you love: ${candidate.artistName}`,
            contribution: BASE_SCORE
        });
    }

    // 2b. Related artist bonus
    if (candidate.sourceType === 'related_artist' && candidate.sourceArtistId) {
        score += BASE_SCORE;
        reasons.push({
            type: 'related_artist',
            label: 'Similar to artists you enjoy',
            contribution: BASE_SCORE
        });
    }

    // 2c. Genre match bonus (exact match)
    const matchedGenres: string[] = [];
    for (const genre of candidate.genres) {
        if (preferences.genreWeights.has(genre)) {
            matchedGenres.push(genre);
        }
    }
    if (matchedGenres.length > 0) {
        score += BASE_SCORE;
        reasons.push({
            type: 'same_genre',
            label: `Matches genres: ${matchedGenres.slice(0, 2).join(', ')}`,
            contribution: BASE_SCORE
        });
    }

    // 2d. Similar genre bonus (partial/related genre match)
    // Boosts tracks from genres that are RELATED to user's favorites
    // E.g., user likes "k-pop" → boost tracks with "korean pop", "j-pop", "pop"
    const { SIMILAR_GENRE_BOOST } = SCORING_CONSTANTS;
    const similarGenres: string[] = [];

    for (const candidateGenre of candidate.genres) {
        // Skip if already matched exactly
        if (matchedGenres.includes(candidateGenre)) continue;

        // Check for similar genres (word overlap)
        for (const userGenre of preferences.genreWeights.keys()) {
            if (genresAreSimilar(candidateGenre, userGenre)) {
                similarGenres.push(candidateGenre);
                break;
            }
        }
    }

    if (similarGenres.length > 0 && matchedGenres.length === 0) {
        // Only apply similar boost if no exact match
        score += SIMILAR_GENRE_BOOST;
        reasons.push({
            type: 'similar_genre',
            label: `Similar to: ${similarGenres.slice(0, 2).join(', ')}`,
            contribution: SIMILAR_GENRE_BOOST
        });
    }

    // Step 3: Community rating (0-5 scale * 10)
    if (communityAvgRating > 0) {
        const contribution = communityAvgRating * COMMUNITY_WEIGHT;
        score += contribution;
        reasons.push({
            type: 'community_rating',
            label: `Community rating: ${communityAvgRating.toFixed(1)}/5`,
            contribution
        });
    }

    // Step 4: User's personal rating if they've rated this track
    const userRating = preferences.userTrackRatings.get(candidate.id);
    if (userRating !== undefined && userRating > 0) {
        const contribution = userRating * USER_RATING_WEIGHT;
        score += contribution;
        // Don't add to reasons since user probably knows they rated it
    }

    // Step 5: Diversity penalty (applied per artist appearance in feed)
    if (artistAppearances > 0) {
        score -= artistAppearances * DIVERSITY_PENALTY;
    }

    // Step 6: Random variance for discovery (±5)
    const randomBonus = Math.floor(Math.random() * (RANDOM_VARIANCE * 2 + 1)) - RANDOM_VARIANCE;
    score += randomBonus;

    return { score, reasons };
}

/**
 * Convert raw score to percentage (0-100)
 */
export function scoreToPercentage(score: number, maxPossibleScore: number = 150): number {
    const percentage = Math.min(100, Math.max(0, (score / maxPossibleScore) * 100));
    return Math.round(percentage);
}

// ============================================
// Main Recommendation Function
// ============================================

/**
 * Generate personalized recommendations for a user
 */
export async function getRecommendations(
    userId: string,
    limit: number = 30
): Promise<RecommendedItem[]> {
    // 1. Get user preferences
    const preferences = await getUserPreferences(userId);

    // If user has no preferences, return empty
    if (preferences.artistIds.length === 0) {
        return [];
    }

    // 2. Get existing favorites to exclude
    const { data: existingFavs } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', userId);

    const existingFavoriteIds = new Set((existingFavs || []).map(f => f.item_id));

    // 3. Build candidate pool
    const candidates = await buildCandidatePool(preferences, existingFavoriteIds);

    // 4. Get community ratings for candidates
    const candidateIds = candidates.map(c => c.id);
    const { data: stats } = await supabase
        .from('item_stats')
        .select('item_id, average_rating')
        .in('item_id', candidateIds);

    const ratingMap = new Map((stats || []).map(s => [s.item_id, s.average_rating || 0]));

    // 5. Score each candidate with diversity tracking
    const artistAppearanceCount = new Map<string, number>();
    const scoredCandidates = candidates.map(candidate => {
        // Track how many times this artist has appeared
        const appearances = artistAppearanceCount.get(candidate.artistId) || 0;
        artistAppearanceCount.set(candidate.artistId, appearances + 1);

        const communityRating = ratingMap.get(candidate.id) || 0;
        const { score, reasons } = scoreCandidate(candidate, preferences, communityRating, appearances);

        return {
            ...candidate,
            score,
            matchPercentage: scoreToPercentage(score),
            reasons
        };
    });

    // 6. Sort by score and take top results
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 7. Convert to RecommendedItem format
    const recommendations: RecommendedItem[] = scoredCandidates
        .slice(0, limit)
        .map(c => ({
            id: c.id,
            type: c.type,
            score: c.score,
            matchPercentage: c.matchPercentage,
            reasons: c.reasons,
            name: c.name,
            artist: c.artistName,
            artistId: c.artistId,
            imageUrl: c.imageUrl,
            genres: c.genres,
            previewUrl: c.previewUrl
        }));

    return recommendations;
}

/**
 * Get recommendations grouped by section
 */
export async function getRecommendationSections(userId: string): Promise<{
    forYou: RecommendedItem[];
    basedOnArtists: RecommendedItem[];
    genreDiscovery: RecommendedItem[];
}> {
    const allRecommendations = await getRecommendations(userId, 50);

    // Group by recommendation type
    const forYou = allRecommendations.slice(0, 12);

    const basedOnArtists = allRecommendations
        .filter(r => r.reasons.some(reason =>
            reason.type === 'same_artist' || reason.type === 'related_artist'
        ))
        .slice(0, 12);

    const genreDiscovery = allRecommendations
        .filter(r => r.reasons.some(reason =>
            reason.type === 'same_genre' || reason.type === 'similar_genre'
        ))
        .slice(0, 12);

    return { forYou, basedOnArtists, genreDiscovery };
}

// ============================================
// Album Recommendations
// ============================================

/**
 * Build a pool of album candidates for recommendations
 * Gets albums from favorite artists and related artists
 */
async function buildAlbumCandidatePool(
    preferences: UserPreferences,
    existingFavoriteIds: Set<string>
): Promise<CandidateItem[]> {
    const candidates: CandidateItem[] = [];
    const seenIds = new Set<string>();

    // Get top artists from preferences
    const topArtists = preferences.artistIds.slice(0, 5);

    console.log('[For You Albums Debug] Building album pool for', topArtists.length, 'artists');

    for (const artistId of topArtists) {
        // Get albums from this artist
        const artistAlbums = await getArtistAlbums(artistId, 10);
        const artistDetails = await getArtistDetails(artistId);

        for (const album of artistAlbums) {
            if (seenIds.has(album.id) || existingFavoriteIds.has(album.id)) continue;
            seenIds.add(album.id);

            candidates.push({
                id: album.id,
                type: 'album',
                name: album.name,
                artistId: artistId,
                artistName: artistDetails?.name || album.artists?.[0]?.name || 'Unknown',
                imageUrl: album.images?.[0]?.url || '',
                genres: artistDetails?.genres || [],
                sourceType: 'favorite_artist'
            });
        }

        // Also get albums from related artists
        const relatedArtists = await getRelatedArtists(artistId);
        for (const related of relatedArtists.slice(0, 2)) {
            const relatedAlbums = await getArtistAlbums(related.id, 5);

            for (const album of relatedAlbums.slice(0, 3)) {
                if (seenIds.has(album.id) || existingFavoriteIds.has(album.id)) continue;
                seenIds.add(album.id);

                candidates.push({
                    id: album.id,
                    type: 'album',
                    name: album.name,
                    artistId: related.id,
                    artistName: related.name,
                    imageUrl: album.images?.[0]?.url || '',
                    genres: related.genres || [],
                    sourceArtistId: artistId,
                    sourceType: 'related_artist'
                });
            }
        }
    }

    console.log('[For You Albums Debug] Album pool built:', candidates.length, 'candidates');
    return candidates;
}

/**
 * Get album recommendations for a user
 */
export async function getAlbumRecommendations(userId: string, limit: number = 30): Promise<RecommendedItem[]> {
    // 1. Build user preferences (same as tracks)
    const preferences = await getUserPreferences(userId);

    if (preferences.artistIds.length === 0) {
        console.log('[For You Albums] No artist preferences found');
        return [];
    }

    // 2. Get existing favorite album IDs
    const { data: favoritesData } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', 'album');

    const existingFavoriteIds = new Set((favoritesData || []).map(f => f.item_id));

    // 3. Build album candidate pool
    const candidates = await buildAlbumCandidatePool(preferences, existingFavoriteIds);

    if (candidates.length === 0) {
        console.log('[For You Albums] No album candidates found');
        return [];
    }

    // 4. Get community ratings for albums
    const albumIds = candidates.map(c => c.id);
    const { data: ratingsData } = await supabase
        .from('item_stats')
        .select('item_id, average_rating')
        .in('item_id', albumIds);

    const ratingMap = new Map((ratingsData || []).map(r => [r.item_id, r.average_rating || 0]));

    // 5. Score each album
    const artistAppearanceCount = new Map<string, number>();
    const scoredCandidates = candidates.map(candidate => {
        const appearances = artistAppearanceCount.get(candidate.artistId) || 0;
        artistAppearanceCount.set(candidate.artistId, appearances + 1);

        const communityRating = ratingMap.get(candidate.id) || 0;
        const { score, reasons } = scoreCandidate(candidate, preferences, communityRating, appearances);

        return {
            ...candidate,
            score,
            matchPercentage: scoreToPercentage(score),
            reasons
        };
    });

    // 6. Sort by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 7. Convert to RecommendedItem
    const recommendations: RecommendedItem[] = scoredCandidates
        .slice(0, limit)
        .map(c => ({
            id: c.id,
            type: c.type,
            score: c.score,
            matchPercentage: c.matchPercentage,
            reasons: c.reasons,
            name: c.name,
            artist: c.artistName,
            artistId: c.artistId,
            imageUrl: c.imageUrl,
            genres: c.genres
        }));

    console.log('[For You Albums] Generated', recommendations.length, 'album recommendations');
    return recommendations;
}
