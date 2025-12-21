// Recommendation types for the For You page

import type { ItemType } from '../../../types/global';

/**
 * User's preference data collected from favorites, ratings, and tags
 */
export interface UserPreferences {
    // Artists the user has shown preference for (from favorites)
    artistIds: string[];

    // Genre weights based on how often they appear in user's favorites
    genreWeights: Map<string, number>;

    // Tags the user has applied to items
    userTags: string[];

    // Items the user has rated highly (above their personal average)
    highRatedItems: {
        itemId: string;
        itemType: ItemType;
        rating: number;
        artistIds?: string[];
        genres?: string[];
    }[];

    // User's average personal rating (for comparison)
    averageRating: number;

    // Artist-specific ratings (artist ID -> user's average rating for that artist)
    artistRatings: Map<string, number>;

    // Genre-specific ratings (genre -> user's average rating for that genre)
    genreRatings: Map<string, number>;
}

/**
 * A recommended item with scoring details
 */
export interface RecommendedItem {
    id: string;
    type: 'track' | 'album';

    // Calculated scores
    score: number;          // Total weighted score
    matchPercentage: number; // 0-100 percentage for display

    // Why this was recommended
    reasons: RecommendationReason[];

    // Spotify metadata (filled in after fetching)
    name: string;
    artist: string;
    artistId: string;
    imageUrl: string;
    genres: string[];
    previewUrl?: string;
}

/**
 * Reason why an item was recommended
 */
export interface RecommendationReason {
    type: 'same_artist' | 'related_artist' | 'same_genre' | 'same_tag' | 'community_rating' | 'highly_rated_artist';
    label: string;          // Human-readable label
    contribution: number;   // How much this reason contributed to the score
}

/**
 * Scoring weights for recommendations
 * These are base weights - they get boosted if user's personal rating is above average
 */
export interface ScoringWeights {
    // Base weights
    sameArtistBase: number;
    relatedArtistBase: number;
    sameGenreBase: number;
    sameTagBase: number;

    // Bonus when user's rating for this category is above their average
    highRatingBonus: number;

    // Community rating multiplier
    communityRatingMultiplier: number;

    // Penalty for already favorited items
    alreadyFavoritedPenalty: number;
}

/**
 * Default scoring weights
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
    sameArtistBase: 30,
    relatedArtistBase: 20,
    sameGenreBase: 15,
    sameTagBase: 10,

    highRatingBonus: 20,  // Add +20 if user rates this category above average

    communityRatingMultiplier: 5,  // avgRating * 5

    alreadyFavoritedPenalty: -1000  // Effectively exclude
};

/**
 * Candidate item before scoring
 */
export interface CandidateItem {
    id: string;
    type: 'track' | 'album';
    name: string;
    artistId: string;
    artistName: string;
    imageUrl: string;
    genres: string[];
    previewUrl?: string;

    // Source of this candidate
    sourceArtistId?: string;      // If from related artist
    sourceType: 'favorite_artist' | 'related_artist' | 'genre_discovery';
}

/**
 * Section of recommendations grouped by reason
 */
export interface RecommendationSection {
    title: string;
    subtitle?: string;
    items: RecommendedItem[];
    sectionType: 'artist_based' | 'genre_based' | 'community' | 'discovery';
}
