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

    // NEW: Artist track counts - tracks rated above avg per artist (for artist boost)
    artistTrackCounts: Map<string, number>;

    // NEW: User's personal ratings for tracks (trackId -> rating)
    userTrackRatings: Map<string, number>;
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
    type: 'same_artist' | 'related_artist' | 'same_genre' | 'similar_genre' | 'same_tag' | 'community_rating' | 'highly_rated_artist';
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
 * New scoring constants for balanced recommendations
 */
export const SCORING_CONSTANTS = {
    BASE_SCORE: 50,           // Equal for all match types (same_artist, related_artist, genre_match)
    ARTIST_BOOST: 25,         // Bonus if 2+ tracks from artist rated above avg
    DIVERSITY_PENALTY: 15,    // Penalty per repeated artist in feed
    COMMUNITY_WEIGHT: 10,     // Multiplier for community rating (0-5 scale)
    USER_RATING_WEIGHT: 15,   // Multiplier for user's personal rating
    RANDOM_VARIANCE: 5,       // ±5 random points for discovery
    SIMILAR_GENRE_BOOST: 30   // Bonus for similar/related genres (partial match)
};

/**
 * @deprecated Use SCORING_CONSTANTS instead
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
    sameArtistBase: 50,
    relatedArtistBase: 50,
    sameGenreBase: 50,
    sameTagBase: 10,

    highRatingBonus: 25,

    communityRatingMultiplier: 10,

    alreadyFavoritedPenalty: -1000
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
