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
}

const ItemModals: React.FC<ItemModalsProps> = ({
    selectedPlaylist,
    selectedTrack,
    selectedAlbum,
    onClose,
}) => {
    return (
        <>
            {/* Expanded Playlist Modal */}
            {selectedPlaylist && (
                <ExpandedPlaylistCard
                    playlist={selectedPlaylist}
                    onClose={onClose}
                />
            )}

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={onClose}
                />
            )}

            {/* Expanded Album Card */}
            {selectedAlbum && (
                <ExpandedAlbumCard
                    albumId={selectedAlbum}
                    onClose={onClose}
                />
            )}
        </>
    );
};

export default ItemModals;
