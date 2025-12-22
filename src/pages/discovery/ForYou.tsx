// For You Page - Personalized recommendations

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Sparkles, Music, Heart, ChevronDown } from 'lucide-react';
import { useForYou } from '../../features/recommendations/hooks/useForYou';
import ParallaxImageTrack from '../../features/recommendations/components/ParallaxImageTrack';
import type { RecommendedItem } from '../../features/recommendations/types/recommendation_types';
import { addToFavourites } from '../../features/favourites/services/favourites_services';
import { getTrackDetails } from '../../features/spotify/services/spotify_services';
import { useSuccess } from '../../context/SuccessContext';
import { useError } from '../../context/ErrorContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { SpotifyTrack } from '../../features/spotify/type/spotify_types';

// Track Modal for viewing track details
import { TrackReviewModal } from '../../features/favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { ExpandedAlbumCard } from '../../features/favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';
import { PlaylistSelectCard } from '../../features/spotify/components/PlaylistSelectCard';

const ForYou: React.FC = () => {
    const {
        forYouSection,
        artistBasedSection,
        genreBasedSection,
        albumRecommendations,
        isLoading,
        isLoadingAlbums,
        error,
        isEmpty,
        refresh,
        loadAlbums
    } = useForYou();

    const { showSuccess } = useSuccess();
    const { showError } = useError();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [playlistModalItem, setPlaylistModalItem] = useState<RecommendedItem | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [contentMode, setContentMode] = useState<'tracks' | 'albums'>('tracks');
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [featuredItem, setFeaturedItem] = useState<RecommendedItem | null>(null);

    const modeDropdownRef = React.useRef<HTMLDivElement>(null);

    // Click outside to close mode dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
                setShowModeDropdown(false);
            }
        };
        if (showModeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModeDropdown]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    };

    const handleItemClick = async (item: RecommendedItem) => {
        // Set as featured item in control box
        setFeaturedItem(item);

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
        } else if (item.type === 'album') {
            // Open album modal
            setSelectedAlbumId(item.id);
        }
    };

    const handleAddToFavourites = async (item: RecommendedItem, isFavourite: boolean) => {
        try {
            if (isFavourite) {
                await addToFavourites(item.id, item.type);
                showSuccess(`Added "${item.name}" to favorites!`);
            } else {
                const { removeFromFavourites } = await import('../../features/favourites/services/favourites_services');
                await removeFromFavourites(item.id, item.type);
                showError(`Removed "${item.name}" from favorites`);
            }
        } catch (err) {
            console.error('Error updating favourites:', err);
            showError('Failed to update favorites');
        }
    };

    const handleAddToPlaylist = (item: RecommendedItem) => {
        if (item.type === 'track') {
            setPlaylistModalItem(item);
        }
    };

    // Load albums when switching to albums mode
    useEffect(() => {
        if (contentMode === 'albums') {
            loadAlbums();
        }
    }, [contentMode, loadAlbums]);

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <Sparkles className="w-8 h-8 text-[#FFD1D1]" />
                        <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">For You Picks</h1>
                    </div>
                    <p className="text-[#D1D1D1]/60 ml-11">Algorithm personalized recommendations</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner className="w-12 h-12" />
                        <p className="text-[#D1D1D1]/60 text-sm">Curating personalized recommendations...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <Sparkles className="w-8 h-8 text-[#FFD1D1]" />
                        <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">For You Picks</h1>
                    </div>
                    <p className="text-[#D1D1D1]/60 ml-11">Algorithm personalized recommendations</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">!!</span>
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
                    <div className="flex items-center gap-3 mb-1">
                        <Sparkles className="w-8 h-8 text-[#FFD1D1]" />
                        <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">For You Picks</h1>
                    </div>
                    <p className="text-[#D1D1D1]/60 ml-11">Algorithm personalized recommendations</p>
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

            {/* Page Title */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Sparkles className="w-8 h-8 text-[#FFD1D1]" />
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">For You Picks</h1>
                </div>
                <p className="text-[#D1D1D1]/60 ml-11">Algorithm personalized recommendations</p>
            </div>

            {/* Content Mode Toggle - Above Main Layout */}
            <div className="mb-4">
                <div className="flex gap-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setContentMode('tracks')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${contentMode === 'tracks' ? 'bg-[#FFD1D1] text-black' : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'}`}
                    >
                        Tracks
                    </button>
                    <button
                        onClick={() => setContentMode('albums')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${contentMode === 'albums' ? 'bg-[#FFD1D1] text-black' : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'}`}
                    >
                        Albums
                    </button>
                </div>
            </div>

            {/* Main Layout: Control Box + Parallax Track */}
            {/* Fixed height to match track (56vmin), gap-6 for spacing */}
            <div className="flex flex-col lg:flex-row gap-6 items-end w-full" style={{ height: '56vmin' }}>

                {/* Left Control Box - height matches track, smaller width */}
                <div
                    className="flex flex-col p-6 rounded-[32px] shadow-lg w-full lg:w-[520px] shrink-0 relative z-10 h-full"
                    style={{ backgroundColor: '#292929' }}
                >
                    {/* Header Row: Title left, Dropdown right */}
                    <div className="w-full flex items-start justify-between mb-3">
                        <div className="text-left">
                            <h2 className="text-lg font-bold mb-0.5 bg-[#FFD1D1] bg-clip-text text-transparent">
                                Personalized Recommendations
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Based on your taste
                            </p>
                        </div>


                    </div>

                    {/* Featured Card + Score Breakdown - fills available space */}
                    <div className="flex-1 flex flex-col gap-3 w-full overflow-hidden">
                        {/* Featured Card - fills full width */}
                        {featuredItem ? (
                            <div
                                className="w-full aspect-[16/9] rounded-xl overflow-hidden relative cursor-pointer group shrink-0"
                                onClick={() => handleItemClick(featuredItem)}
                            >
                                <img
                                    src={featuredItem.imageUrl}
                                    alt={featuredItem.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="text-white font-semibold text-base truncate">{featuredItem.name}</p>
                                    <p className="text-gray-300 text-sm truncate">{featuredItem.artist}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-[16/9] rounded-xl bg-white/5 flex items-center justify-center border-2 border-dashed border-white/20 shrink-0">
                                <div className="text-center text-gray-500">
                                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Click a card to feature it</p>
                                </div>
                            </div>
                        )}

                        {/* Score Breakdown - fills remaining space */}
                        {featuredItem && (
                            <div className="flex-1 w-full bg-white/5 rounded-xl p-4 text-left">
                                <p className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">Why We Recommend This</p>
                                <div className="space-y-2">
                                    {/* Match Percentage */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold">Match</span>
                                        <span className="text-lg font-bold bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
                                            {Math.round(featuredItem.matchPercentage)}%
                                        </span>
                                    </div>

                                    <div className="border-t border-white/10 pt-2 space-y-1">
                                        {/* Show all reasons, not just 4 */}
                                        {featuredItem.reasons.map((reason, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-300 capitalize">
                                                    {reason.type.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`font-medium ${reason.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {reason.contribution >= 0 ? '+' : ''}{Math.round(reason.contribution)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total Score */}
                                    <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Total Score</span>
                                        <span className="text-white font-bold">{Math.round(featuredItem.score)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Content area - fills height, aligns cards left */}
                <div className="flex-1 flex flex-col justify-start items-start min-w-0 relative z-20">

                    {/* Tracks mode */}
                    {contentMode === 'tracks' && (forYouSection.length > 0 || artistBasedSection.length > 0 || genreBasedSection.length > 0) && (
                        <div className="w-full h-full"> {/* Full height wrapper */}
                            <ParallaxImageTrack
                                items={forYouSection}
                                tabs={[
                                    {
                                        id: 'top-picks',
                                        label: 'Top Picks',
                                        items: forYouSection
                                    },
                                    {
                                        id: 'artists',
                                        label: 'Artists You Like',
                                        items: artistBasedSection
                                    },
                                    {
                                        id: 'genres',
                                        label: 'Genre Discovery',
                                        items: genreBasedSection
                                    }
                                ]}
                                onItemClick={handleItemClick}
                                onAddToFavourites={handleAddToFavourites}
                                onAddToPlaylist={handleAddToPlaylist}
                                onRefresh={handleRefresh}
                                isRefreshing={isRefreshing}
                            />
                        </div>
                    )}

                    {/* Albums mode */}
                    {contentMode === 'albums' && (
                        <div className="w-full h-full">
                            {isLoadingAlbums ? (
                                <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                                    <LoadingSpinner className="w-12 h-12" />
                                </div>
                            ) : albumRecommendations.length > 0 ? (
                                <ParallaxImageTrack
                                    items={albumRecommendations}
                                    tabs={[{
                                        id: 'recommended-albums',
                                        label: 'Top Picks',
                                        items: albumRecommendations
                                    }]}
                                    onItemClick={handleItemClick}
                                    onAddToFavourites={handleAddToFavourites}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full min-h-[400px] text-[#D1D1D1]/50 bg-black/20 rounded-[32px]">
                                    <div className="text-center">
                                        <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">No album recommendations yet</p>
                                        <p className="text-sm mt-2">Rate some tracks to get personalized albums!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Album Review Modal */}
            {selectedAlbumId && (
                <ExpandedAlbumCard
                    albumId={selectedAlbumId}
                    onClose={() => setSelectedAlbumId(null)}
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

