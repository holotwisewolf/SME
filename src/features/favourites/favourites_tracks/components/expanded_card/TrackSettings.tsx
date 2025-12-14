import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Trash2, Heart, FolderPlus } from 'lucide-react';
import { checkIsFavourite, addToFavourites } from '../../../services/favourites_services';
import { PlaylistSelectCard } from '../../../../spotify/components/PlaylistSelectCard';
import { useSuccess } from '../../../../../context/SuccessContext';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';

interface TrackSettingsProps {
    track: SpotifyTrack;
    handleCopyLink: () => void;
    handleRemoveFromFavourites: () => void;
}

export const TrackSettings: React.FC<TrackSettingsProps> = ({
    track,
    handleCopyLink,
    handleRemoveFromFavourites
}) => {
    const { showSuccess } = useSuccess();
    const [isFavorited, setIsFavorited] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false);

    useEffect(() => {
        // Check if track is favorited
        checkIsFavourite(track.id, 'track').then(setIsFavorited);
    }, [track.id]);

    const handleAddToFavorites = async () => {
        if (isFavorited) return; // Don't add if already favorited

        try {
            await addToFavourites(track.id, 'track');
            setIsFavorited(true);
            showSuccess('Track added to favorites!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    const handleCopyLinkWithSuccess = () => {
        handleCopyLink();
        showSuccess('Copied!');
    };

    return (
        <>
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6 h-full overflow-y-auto pr-2">
                    {/* Actions */}
                    <div>
                        <h3 className="text-white font-medium mb-2">Actions</h3>

                        {/* Add to Playlist */}
                        <button
                            onClick={() => setShowPlaylistModal(true)}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group mb-3"
                        >
                            <div className="flex items-center gap-3">
                                <FolderPlus className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Add to Playlist</span>
                            </div>
                        </button>

                        {/* Add to Favorites - Always visible, greyed out when favorited */}
                        <div className="relative">
                            <button
                                onClick={handleAddToFavorites}
                                onMouseEnter={() => isFavorited && setShowFavoriteTooltip(true)}
                                onMouseLeave={() => setShowFavoriteTooltip(false)}
                                disabled={isFavorited}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group mb-3 ${isFavorited
                                    ? 'bg-gray-800/30 cursor-not-allowed opacity-50'
                                    : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Heart className={`w-5 h-5 ${isFavorited ? 'text-gray-600 fill-gray-600' : 'text-[#1DB954]'}`} />
                                    <span className={isFavorited ? 'text-gray-600' : 'text-gray-300'}>Add to Favorites</span>
                                </div>
                            </button>

                            {/* Tooltip */}
                            {showFavoriteTooltip && isFavorited && (
                                <div className="absolute left-0 top-full mt-1 bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                                    Already favorited
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCopyLinkWithSuccess}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group mb-3"
                        >
                            <div className="flex items-center gap-3">
                                <Copy className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Copy Spotify Link</span>
                            </div>
                        </button>
                        <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <ExternalLink className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">View on Spotify</span>
                            </div>
                        </a>
                    </div>

                    {/* Danger Zone */}
                    <div>
                        <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                        <button
                            onClick={isFavorited ? handleRemoveFromFavourites : undefined}
                            disabled={!isFavorited}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group border ${isFavorited
                                ? 'bg-white/5 hover:bg-white/10 border-red-500/20 hover:border-red-500/50 cursor-pointer'
                                : 'bg-gray-800/30 border-gray-700/20 cursor-not-allowed opacity-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className={`w-5 h-5 ${isFavorited ? 'text-red-500' : 'text-gray-600'}`} />
                                <span className={isFavorited ? 'text-red-500' : 'text-gray-600'}>Remove from Favourites</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Playlist Selection Modal */}
            {showPlaylistModal && (
                <PlaylistSelectCard
                    trackId={track.id}
                    trackName={track.name}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </>
    );
};
