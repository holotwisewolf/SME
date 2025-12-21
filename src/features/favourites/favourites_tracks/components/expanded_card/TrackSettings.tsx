import React from 'react';
import { Copy, ExternalLink, Heart, FolderPlus } from 'lucide-react';
// Services moved to parent
import { useSuccess } from '../../../../../context/SuccessContext';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';

interface TrackSettingsProps {
    track: SpotifyTrack;
    handleCopyLink: () => void;
    isFavourite?: boolean;
    onToggleFavourite?: () => void;
    onOpenPlaylistModal?: () => void;
}

export const TrackSettings: React.FC<TrackSettingsProps> = ({
    track,
    handleCopyLink,
    isFavourite,
    onToggleFavourite,
    onOpenPlaylistModal
}) => {
    const { showSuccess } = useSuccess();

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
                            onClick={() => onOpenPlaylistModal?.()}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group mb-3"
                        >
                            <div className="flex items-center gap-3">
                                <FolderPlus className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Add to Playlist</span>
                            </div>
                        </button>

                        {/* Add to Favorites */}
                        <button
                            onClick={onToggleFavourite}
                            disabled={!onToggleFavourite || isFavourite}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <Heart className={`w-5 h-5 text-[#1DB954]`} />
                                <span className="text-gray-300">Add to Favorites</span>
                            </div>
                        </button>

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
                            onClick={onToggleFavourite}
                            disabled={!isFavourite || !onToggleFavourite}
                            className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            Remove from Favourites
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
