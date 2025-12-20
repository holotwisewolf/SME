import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyResultItem from './SpotifyResultItem';
import SpotifyAlbumItem from './SpotifyAlbumItem';
import SpotifyArtistItem from './SpotifyArtistItem';
import { TrackPreviewAudio } from './TrackPreviewAudio';
import { ResultMenuDropdown } from './ResultMenuDropdown';
import { TrackReviewModal } from '../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { PlaylistSelectCard } from './PlaylistSelectCard';
import { ArtistDetailModal } from './ArtistDetailModal';
import { ExpandedAlbumCard } from '../../favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';
import { useSpotifyResultList } from '../hooks/useSpotifyResultList';
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../type/spotify_types';

type SearchType = 'Tracks' | 'Albums' | 'Artists';

interface SpotifyResultListProps {
    results: any[];
    type: SearchType;
    selectedIndex: number;
    isLoading: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    searchText?: string;
}

const SpotifyResultList: React.FC<SpotifyResultListProps> = ({
    results,
    type,
    selectedIndex,
    isLoading,
    isOpen = true,
    onClose,
    searchText = ''
}) => {
    const {
        containerRef,
        playPreview,
        stopPreview,
        isArtistPopupOpen,
        selectedArtist,
        closeArtistPopup,
        playlistModalTrack,
        setPlaylistModalTrack,
        selectedTrack,
        setSelectedTrack,
        selectedAlbum,
        setSelectedAlbum,
        activeMenuId,
        setActiveMenuId,
        handleAddToFavourites,
        handleAddAlbumToFavourites,
        handleAddToPlaylist,
        handleImportAlbumToPlaylist,
        handleTrackClick,
        handleAlbumClick,
        handleArtistClick,
        handleViewFullPage
    } = useSpotifyResultList(type, searchText, onClose);

    if ((!results || !Array.isArray(results) || results.length === 0) && !isLoading && !searchText) return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (results.length > 0 || isLoading || searchText) && (
                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                        style={{ maxHeight: '24rem' }}
                    >
                        <div
                            className="overflow-y-auto flex-1 premium-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#4a5568 transparent',
                                direction: 'rtl'
                            }}
                        >
                            <div style={{ direction: 'ltr' }}>
                                {isLoading && results.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        Searching Spotify...
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {results.length > 0 ? (
                                            results.map((item, index) => {
                                                const isSelected = index === selectedIndex;
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
                                                                    type="track"
                                                                />
                                                            </div>
                                                        </TrackPreviewAudio>
                                                    );
                                                } else if (type === 'Albums') {
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <SpotifyAlbumItem
                                                                    key={item.id}
                                                                    album={item as SpotifyAlbum}
                                                                    isSelected={isSelected}
                                                                    onSelect={() => handleAlbumClick(item as SpotifyAlbum)}
                                                                />
                                                            </div>
                                                            <ResultMenuDropdown
                                                                trackId={item.id}
                                                                trackName={item.name}
                                                                spotifyUrl={(item as SpotifyAlbum).external_urls.spotify}
                                                                isOpen={activeMenuId === item.id}
                                                                onToggle={(isOpen) => setActiveMenuId(isOpen ? item.id : null)}
                                                                onAddToFavourites={handleAddAlbumToFavourites}
                                                                onImportToPlaylist={(id) => handleImportAlbumToPlaylist(id, item.name)}
                                                                type="album"
                                                            />
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                key={item.id}
                                                                onClick={() => handleArtistClick(item as SpotifyArtist)}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <SpotifyArtistItem
                                                                    artist={item as SpotifyArtist}
                                                                    isSelected={isSelected}
                                                                    onSelect={() => handleArtistClick(item as SpotifyArtist)}
                                                                />
                                                            </div>
                                                            <ResultMenuDropdown
                                                                trackId={item.id}
                                                                trackName={item.name}
                                                                spotifyUrl={(item as SpotifyArtist).external_urls.spotify}
                                                                isOpen={activeMenuId === item.id}
                                                                onToggle={(isOpen) => setActiveMenuId(isOpen ? item.id : null)}
                                                                onAddToFavourites={() => { }}
                                                                onAddToPlaylist={() => { }}
                                                                hideActions={true}
                                                                type="artist"
                                                            />
                                                        </div>
                                                    );
                                                }
                                            })
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No results found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

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

            {isArtistPopupOpen && selectedArtist && (
                <ArtistDetailModal
                    artist={selectedArtist}
                    onClose={closeArtistPopup}
                />
            )}

            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {selectedAlbum && (
                <ExpandedAlbumCard
                    albumId={selectedAlbum.id}
                    onClose={() => setSelectedAlbum(null)}
                />
            )}

            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackId={playlistModalTrack.id}
                    trackIds={playlistModalTrack.trackIds}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}

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
