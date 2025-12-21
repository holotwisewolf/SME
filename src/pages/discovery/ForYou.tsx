// For You Page - Personalized recommendations

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Sparkles, Music, Heart } from 'lucide-react';
import { useForYou } from '../../features/recommendations/hooks/useForYou';
import RecommendationSection from '../../features/recommendations/components/RecommendationSection';
import type { RecommendedItem } from '../../features/recommendations/types/recommendation_types';
import { addToFavourites } from '../../features/favourites/services/favourites_services';
import { getTrackDetails } from '../../features/spotify/services/spotify_services';
import { useSuccess } from '../../context/SuccessContext';
import { useError } from '../../context/ErrorContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { SpotifyTrack } from '../../features/spotify/type/spotify_types';

// Track Modal for viewing track details
import { TrackReviewModal } from '../../features/favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { PlaylistSelectCard } from '../../features/spotify/components/PlaylistSelectCard';

const ForYou: React.FC = () => {
    const {
        forYouSection,
        artistBasedSection,
        genreBasedSection,
        isLoading,
        error,
        isEmpty,
        refresh
    } = useForYou();

    const { showSuccess } = useSuccess();
    const { showError } = useError();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [playlistModalItem, setPlaylistModalItem] = useState<RecommendedItem | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    };

    const handleItemClick = async (item: RecommendedItem) => {
        if (item.type === 'track') {
            setIsLoadingTrack(true);
            try {
                // Fetch full track data for the modal
                const trackData = await getTrackDetails(item.id);
                setSelectedTrack(trackData);
            } catch (err) {
                console.error('Error fetching track details:', err);
                showError('Failed to load track details');
            } finally {
                setIsLoadingTrack(false);
            }
        }
        // TODO: Handle album clicks
    };

    const handleAddToFavourites = async (item: RecommendedItem) => {
        try {
            await addToFavourites(item.id, item.type);
            showSuccess(`Added "${item.name}" to favorites!`);
        } catch (err) {
            console.error('Error adding to favourites:', err);
            showError('Failed to add to favorites');
        }
    };

    const handleAddToPlaylist = (item: RecommendedItem) => {
        if (item.type === 'track') {
            setPlaylistModalItem(item);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">For You</h1>
                    <p className="text-[#D1D1D1]/60 mt-2">AI-powered personalized recommendations</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">For You</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <p className="text-[#D1D1D1]/60">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state - no user preferences yet
    if (isEmpty) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">For You</h1>
                    <p className="text-[#D1D1D1]/60 mt-2">AI-powered personalized recommendations</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md"
                    >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD1D1]/30 to-[#696969]/30 flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-[#FFD1D1]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#D1D1D1] mb-3">
                            Start Building Your Taste Profile
                        </h2>
                        <p className="text-[#D1D1D1]/60 mb-6">
                            Favorite some tracks and albums, rate music you love, and we'll create personalized recommendations just for you.
                        </p>
                        <div className="flex flex-col gap-3 text-sm text-[#D1D1D1]/50">
                            <div className="flex items-center justify-center gap-2">
                                <Heart className="w-4 h-4 text-[#FFD1D1]" />
                                <span>Add tracks and albums to favorites</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Music className="w-4 h-4 text-[#FFD1D1]" />
                                <span>Rate music to refine recommendations</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Main content - recommendations
    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            {/* Loading overlay when fetching track */}
            {isLoadingTrack && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">For You</h1>
                        <Sparkles className="w-8 h-8 text-[#FFD1D1]" />
                    </div>
                    <p className="text-[#D1D1D1]/60 mt-2">Personalized music recommendations based on your taste</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#292929] hover:bg-[#3a3a3a] text-[#D1D1D1] rounded-lg border border-[#D1D1D1]/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Recommendation Sections */}
            <div className="space-y-8">
                {/* Top Picks */}
                {forYouSection.length > 0 && (
                    <RecommendationSection
                        title="Top Picks For You"
                        subtitle="Based on your favorites and ratings"
                        items={forYouSection}
                        onItemClick={handleItemClick}
                        onAddToFavourites={handleAddToFavourites}
                        onAddToPlaylist={handleAddToPlaylist}
                    />
                )}

                {/* Based on Artists */}
                {artistBasedSection.length > 0 && (
                    <RecommendationSection
                        title="Because You Like These Artists"
                        subtitle="Discover more from artists you love"
                        items={artistBasedSection}
                        onItemClick={handleItemClick}
                        onAddToFavourites={handleAddToFavourites}
                        onAddToPlaylist={handleAddToPlaylist}
                    />
                )}

                {/* Genre Discovery */}
                {genreBasedSection.length > 0 && (
                    <RecommendationSection
                        title="Genre Discovery"
                        subtitle="Explore your favorite genres"
                        items={genreBasedSection}
                        onItemClick={handleItemClick}
                        onAddToFavourites={handleAddToFavourites}
                        onAddToPlaylist={handleAddToPlaylist}
                    />
                )}
            </div>

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Add to Playlist Modal */}
            {playlistModalItem && (
                <PlaylistSelectCard
                    trackId={playlistModalItem.id}
                    trackName={playlistModalItem.name}
                    onClose={() => setPlaylistModalItem(null)}
                />
            )}
        </div>
    );
};

export default ForYou;
