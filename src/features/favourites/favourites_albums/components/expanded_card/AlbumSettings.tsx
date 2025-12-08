import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';
import { useSuccess } from '../../../../../context/SuccessContext';

interface AlbumSettingsProps {
    albumSpotifyUrl?: string;
    onRemove: () => void;
    isEditingEnabled: boolean;
    setIsEditingEnabled: (enabled: boolean) => void;
}

export const AlbumSettings: React.FC<AlbumSettingsProps> = ({
    albumSpotifyUrl,
    onRemove,
    isEditingEnabled,
    setIsEditingEnabled
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
                    </div>
                </div>

                {/* --- Edit --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Edit</h3>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm">Enable Editing Mode</span>
                        <button
                            onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${isEditingEnabled ? 'bg-[#1DB954]' : 'bg-gray-600'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isEditingEnabled ? 'right-1' : 'left-1'
                                }`}></div>
                        </button>
                    </div>
                </div>

                {/* --- Danger Zone --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                    <button
                        onClick={onRemove}
                        className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left"
                    >
                        Remove from Favourites
                    </button>
                </div>

            </div>
        </div>
    );
};