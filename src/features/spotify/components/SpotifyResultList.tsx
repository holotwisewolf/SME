/**
 * SpotifyResultList Component
 * 
 * Displays search results from Spotify API in a dropdown list.
 * Supports tracks, albums, and artists with different rendering for each type.
 * Includes track preview playback, dropdown menus, and modal interactions.
 */

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpotifyResultItem from './SpotifyResultItem';
import SpotifyAlbumItem from './SpotifyAlbumItem';
import SpotifyArtistItem from './SpotifyArtistItem';
import { TrackPreviewAudio } from './TrackPreviewAudio';
import { ResultMenuDropdown } from './ResultMenuDropdown';
import { TrackDetailModal } from './TrackDetailModal';
import { PlaylistSelectCard } from './PlaylistSelectCard';
import { ArtistPopupCard } from './ArtistPopupCard';
import { useTrackPreview } from '../hooks/useTrackPreview';
import { useArtistPopup } from '../hooks/useArtistPopup';
import { addToFavourites } from '../services/playlist_services';
import type { ArtistFullDetail } from '../contracts/artist_contract';
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../type/spotify_types';

type SearchType = 'Tracks' | 'Albums' | 'Artists';

interface SpotifyResultListProps {
    results: any[];
    type: SearchType;
    selectedIndex: number;
    onSelect: (item: any) => void;
    isLoading: boolean;
    isOpen?: boolean; // Controls visibility - when false, results are hidden
    onClose?: () => void;
    searchText?: string;
}

const SpotifyResultList: React.FC<SpotifyResultListProps> = ({
    results,
    type,
    selectedIndex,
    onSelect,
    isLoading,
    isOpen = true, // Default to true for backward compatibility
    onClose,
    searchText = ''
}) => {
    // Navigation hook for "View Full Page" button
    const navigate = useNavigate();

    // Ref for the results container (used for positioning calculations)
    const containerRef = useRef<HTMLDivElement>(null);

    // Track preview audio controls
    const { playPreview, stopPreview } = useTrackPreview();

    // Artist popup modal state management
    const { isOpen: isArtistPopupOpen, selectedArtist, openPopup: openArtistPopup, closePopup: closeArtistPopup } = useArtistPopup();

    // Playlist selection modal state
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id: string; name: string } | null>(null);

    // Track detail modal state
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

    // Active menu state for controlled dropdowns
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Handler: Add track to user's favourites
    const handleAddToFavourites = async (trackId: string) => {
        try {
            await addToFavourites(trackId);
            // TODO: Show success notification
        } catch (error) {
            console.error('Error adding to favourites:', error);
        }
    };

    // Handler: Open playlist selection modal for a track
    const handleAddToPlaylist = (trackId: string, trackName: string) => {
        setPlaylistModalTrack({ id: trackId, name: trackName });
    };

    // Handler: Open track detail modal
    const handleTrackClick = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    // Handler: Open artist details popup when artist is clicked
    const handleArtistClick = (artist: SpotifyArtist) => {
        const artistDetail: ArtistFullDetail = {
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images?.[0]?.url,
            genres: artist.genres,
            followers: artist.followers?.total,
            externalUrl: artist.external_urls?.spotify
        };
        openArtistPopup(artistDetail);
    };

    // Handler: Navigate to full page view based on search type
    const handleViewFullPage = () => {
        const searchParam = searchText ? `?search=${encodeURIComponent(searchText)}` : '';
        if (type === 'Tracks') {
            navigate(`/tracksfullpage${searchParam}`);
        } else if (type === 'Albums') {
            navigate(`/albumsfullpage${searchParam}`);
        } else if (type === 'Artists') {
            navigate(`/artistsfullpage${searchParam}`);
        }
        onClose?.();
    };

    // Early return: Don't render if no results and not loading
    if ((!results || !Array.isArray(results) || results.length === 0) && !isLoading) return null;


    return (
        <>
            {/* Main Results Dropdown with Animation */}
            <AnimatePresence>
                {/* Render only if isOpen is true AND (there are results OR loading) */}
                {isOpen && (results.length > 0 || isLoading) && (
                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                        style={{ maxHeight: '24rem' }}
                    >
                        {/* Scrollable Content Area - RTL for scrollbar positioning */}
                        <div
                            className="overflow-y-auto flex-1 premium-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#4a5568 transparent',
                                direction: 'rtl' // Scrollbar on left side
                            }}
                        >
                            {/* Content wrapper - LTR to restore normal text direction */}
                            <div style={{ direction: 'ltr' }}>
                                {/* Loading State */}
                                {isLoading && results.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        Searching Spotify...
                                    </div>
                                ) : (
                                    /* Results List */
                                    <div className="p-2 space-y-1">
                                        {/* Map through results and render based on type */}
                                        {results.map((item, index) => {
                                            const isSelected = index === selectedIndex;

                                            /* Render Tracks with preview audio and dropdown menu */
                                            if (type === 'Tracks') {
                                                const track = item as SpotifyTrack;
                                                return (
                                                    <TrackPreviewAudio
                                                        key={track.id}
                                                        trackId={track.id}
                                                        previewUrl={track.preview_url ?? undefined}
                                                        onPlayPreview={playPreview}
                                                        onStopPreview={stopPreview}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <SpotifyResultItem
                                                                    track={track}
                                                                    isSelected={isSelected}
                                                                    onSelect={() => handleTrackClick(track)}
                                                                />
                                                            </div>
                                                            <ResultMenuDropdown
                                                                trackId={track.id}
                                                                trackName={track.name}
                                                                spotifyUrl={track.external_urls.spotify}
                                                                isOpen={activeMenuId === track.id}
                                                                onToggle={(isOpen) => setActiveMenuId(isOpen ? track.id : null)}
                                                                onAddToFavourites={handleAddToFavourites}
                                                                onAddToPlaylist={(trackId) => handleAddToPlaylist(trackId, track.name)}
                                                            />
                                                        </div>
                                                    </TrackPreviewAudio>
                                                );
                                                /* Render Albums */
                                            } else if (type === 'Albums') {
                                                return (
                                                    <SpotifyAlbumItem
                                                        key={item.id}
                                                        album={item as SpotifyAlbum}
                                                        isSelected={isSelected}
                                                        onSelect={onSelect}
                                                    />
                                                );
                                                /* Render Artists with click handler for popup */
                                            } else {
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleArtistClick(item as SpotifyArtist)}
                                                        className="cursor-pointer"
                                                    >
                                                        <SpotifyArtistItem
                                                            artist={item as SpotifyArtist}
                                                            isSelected={isSelected}
                                                            onSelect={onSelect}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - "View Full Page" Button (sticky at bottom) */}
                        {results.length > 0 && (
                            <div className="border-t border-white/5 bg-[#1a1a1a]">
                                <button
                                    onClick={handleViewFullPage}
                                    className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors font-medium"
                                >
                                    View Full Page
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Artist Details Popup Modal */}
            {isArtistPopupOpen && selectedArtist && (
                <ArtistPopupCard
                    artist={selectedArtist}
                    onClose={closeArtistPopup}
                />
            )}

            {/* Track Detail Modal */}
            {selectedTrack && (
                <TrackDetailModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                    onAddToFavourites={handleAddToFavourites}
                    onAddToPlaylist={(trackId) => handleAddToPlaylist(trackId, selectedTrack.name)}
                />
            )}

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackId={playlistModalTrack.id}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}

            {/* Custom Scrollbar Styles */}
            <style>{`
                .premium-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .premium-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #4a5568;
                    border-radius: 3px;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #5a6678;
                }
            `}</style>
        </>
    );
};

export default SpotifyResultList;
