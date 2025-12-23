// ItemModals - Manages all expanded card/modal rendering

import React from 'react';
import { ExpandedPlaylistCard } from '../../../playlist/components/expanded_card/ExpandedPlaylistCard';
import { TrackReviewModal } from '../../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { ExpandedAlbumCard } from '../../../favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';

interface ItemModalsProps {
    selectedPlaylist: any | null;
    selectedTrack: SpotifyTrack | null;
    selectedAlbum: string | null;
    onClose: () => void;
    initialTab?: any;
    initialIsTagMenuOpen?: boolean;
}

const ItemModals: React.FC<ItemModalsProps> = ({
    selectedPlaylist,
    selectedTrack,
    selectedAlbum,
    onClose,
    initialTab,
    initialIsTagMenuOpen
}) => {
    return (
        <>
            {/* Expanded Playlist Modal */}
            {selectedPlaylist && (
                <ExpandedPlaylistCard
                    playlist={selectedPlaylist}
                    onClose={onClose}
                    initialTab={initialTab}
                    initialIsTagMenuOpen={initialIsTagMenuOpen}
                />
            )}

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={onClose}
                    initialTab={initialTab}
                    initialIsTagMenuOpen={initialIsTagMenuOpen}
                />
            )}

            {/* Expanded Album Card */}
            {selectedAlbum && (
                <ExpandedAlbumCard
                    albumId={selectedAlbum}
                    onClose={onClose}
                    initialTab={initialTab}
                    initialIsTagMenuOpen={initialIsTagMenuOpen}
                />
            )}
        </>
    );
};

export default ItemModals;
