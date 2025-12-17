import React from 'react';
import { ExternalLink, Copy, FolderPlus } from 'lucide-react';
import { useSuccess } from '../../../../../context/SuccessContext';

interface AlbumSettingsProps {
    albumSpotifyUrl?: string;
    onRemove: () => void;
    onImportToPlaylist?: () => void;
    isFavourite?: boolean;
    onToggleFavourite?: () => void;
}

export const AlbumSettings: React.FC<AlbumSettingsProps> = ({
    albumSpotifyUrl,
    onRemove,
    onImportToPlaylist,
    isFavourite,
    onToggleFavourite
}) => {
    const { showSuccess } = useSuccess();

    const handleViewOnSpotify = () => {
        if (albumSpotifyUrl) {
            window.open(albumSpotifyUrl, '_blank');
        }
    };

    const handleCopySpotifyLink = () => {
        if (albumSpotifyUrl) {
            navigator.clipboard.writeText(albumSpotifyUrl);
            showSuccess('Spotify link copied to clipboard');
        }
    };

    return (
        <div className="flex-1 min-h-0">
            <div className="space-y-6 h-full overflow-y-auto pr-2 pb-6">

                {/* --- Actions --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={handleViewOnSpotify}
                            disabled={!albumSpotifyUrl}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <ExternalLink className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">View on Spotify</span>
                            </div>
                        </button>

                        <button
                            onClick={handleCopySpotifyLink}
                            disabled={!albumSpotifyUrl}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <Copy className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Copy Spotify Link</span>
                            </div>
                        </button>

                        <button
                            onClick={onImportToPlaylist}
                            disabled={!onImportToPlaylist}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <FolderPlus className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Import to Playlist</span>
                            </div>
                        </button>

                        <button
                            onClick={onToggleFavourite}
                            disabled={!onToggleFavourite || isFavourite}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#1DB954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-gray-300">Add to Favourites</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* --- Danger Zone --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                    <button
                        onClick={onRemove}
                        disabled={!isFavourite}
                        className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        Remove from Favourites
                    </button>
                </div>

            </div>
        </div>
    );
};