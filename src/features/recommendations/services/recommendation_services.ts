// Recommendation services - core logic for For You page

import { supabase } from '../../../lib/supabaseClient';
import {
    getMultipleTracks,
    getMultipleAlbums,
    getArtistDetails
} from '../../spotify/services/spotify_services';
import { spotifyFetch } from '../../spotify/services/spotifyConnection';
import type {
    UserPreferences,
    RecommendedItem,
    CandidateItem,
    ScoringWeights,
    RecommendationReason
} from '../types/recommendation_types';
import { DEFAULT_SCORING_WEIGHTS } from '../types/recommendation_types';
import type { ItemType } from '../../../types/global';

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

    const [tracksData, albumsData] = await Promise.all([
        trackFavIds.length > 0 ? getMultipleTracks(trackFavIds) : { tracks: [] },
        albumFavIds.length > 0 ? getMultipleAlbums(albumFavIds) : { albums: [] }
    ]);

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

    return {
        artistIds: Array.from(artistIds),
        genreWeights,
        userTags: Array.from(tagNames),
        highRatedItems,
        averageRating: avgRating,
        artistRatings,
        genreRatings: new Map() // Will be populated if needed
    };
}

// ============================================
// Spotify API - Related Artists
// ============================================

/**
 * Get related artists from Spotify API
 */
export async function getRelatedArtists(artistId: string): Promise<any[]> {
    try {
        const data = await spotifyFetch(`artists/${artistId}/related-artists`);
        return data?.artists || [];
    } catch (error) {
        console.error('Error fetching related artists:', error);
        return [];
    }
}

/**
 * Get artist's top tracks from Spotify API
 */
export async function getArtistTopTracks(artistId: string, market: string = 'US'): Promise<any[]> {
    try {
        const data = await spotifyFetch(`artists/${artistId}/top-tracks?market=${market}`);
        return data?.tracks || [];
    } catch (error) {
        console.error('Error fetching artist top tracks:', error);
        return [];
    }
}

// ============================================
// Candidate Pool Building
// ============================================

/**
 * Build a pool of candidate items for recommendations
 */
export async function buildCandidatePool(
    preferences: UserPreferences,
    existingFavoriteIds: Set<string>
): Promise<CandidateItem[]> {
    const candidates: CandidateItem[] = [];
    const seenIds = new Set<string>();

    // 1. Get top tracks from favorite artists' related artists
    const topArtists = preferences.artistIds.slice(0, 5);

    for (const artistId of topArtists) {
        // Get related artists
        const relatedArtists = await getRelatedArtists(artistId);

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
        const artistTopTracks = await getArtistTopTracks(artistId);
        const artistDetails = await getArtistDetails(artistId);

        for (const track of artistTopTracks.slice(0, 5)) {
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

    return candidates;
}

// ============================================
// Scoring
// ============================================

/**
 * Calculate recommendation score for a candidate item
 */
export function scoreCandidate(
    candidate: CandidateItem,
    preferences: UserPreferences,
    communityAvgRating: number = 0,
    weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const userAvg = preferences.averageRating;

    // 1. Same artist bonus
    if (preferences.artistIds.includes(candidate.artistId)) {
        const artistRating = preferences.artistRatings.get(candidate.artistId) || 0;
        const baseScore = weights.sameArtistBase;
        const bonus = artistRating > userAvg ? weights.highRatingBonus : 0;
        const contribution = baseScore + bonus;

        score += contribution;
        reasons.push({
            type: 'same_artist',
            label: `From artist you love: ${candidate.artistName}`,
            contribution
        });
    }

    // 2. Related artist bonus
    if (candidate.sourceType === 'related_artist' && candidate.sourceArtistId) {
        const sourceArtistRating = preferences.artistRatings.get(candidate.sourceArtistId) || 0;
        const baseScore = weights.relatedArtistBase;
        const bonus = sourceArtistRating > userAvg ? weights.highRatingBonus : 0;
        const contribution = baseScore + bonus;

        score += contribution;
        reasons.push({
            type: 'related_artist',
            label: 'Similar to artists you enjoy',
            contribution
        });
    }

    // 3. Genre overlap bonus
    let genreContribution = 0;
    const matchedGenres: string[] = [];
    for (const genre of candidate.genres) {
        if (preferences.genreWeights.has(genre)) {
            const genreWeight = preferences.genreWeights.get(genre) || 1;
            const baseScore = weights.sameGenreBase;
            // Bonus if this genre appears frequently in user's preferences
            const bonus = genreWeight > 2 ? weights.highRatingBonus : 0;
            genreContribution += baseScore + bonus;
            matchedGenres.push(genre);
        }
    }
    if (genreContribution > 0) {
        score += genreContribution;
        reasons.push({
            type: 'same_genre',
            label: `Matches your favorite genres: ${matchedGenres.slice(0, 2).join(', ')}`,
            contribution: genreContribution
        });
    }

    // 4. Community rating boost
    if (communityAvgRating > 0) {
        const contribution = communityAvgRating * weights.communityRatingMultiplier;
        score += contribution;
        reasons.push({
            type: 'community_rating',
            label: `Highly rated by community (${communityAvgRating.toFixed(1)}/10)`,
            contribution
        });
    }

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

    // 5. Score each candidate
    const scoredCandidates = candidates.map(candidate => {
        const communityRating = ratingMap.get(candidate.id) || 0;
        const { score, reasons } = scoreCandidate(candidate, preferences, communityRating);

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
        .filter(r => r.reasons.some(reason => reason.type === 'same_genre'))
        .slice(0, 12);

    return { forYou, basedOnArtists, genreDiscovery };
}
