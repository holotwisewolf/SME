import React from 'react';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';

interface TrackSettingsProps {
    track: SpotifyTrack;
    isEditingEnabled: boolean;
    setIsEditingEnabled: (enabled: boolean) => void;
    handleCopyLink: () => void;
    handleRemoveFromFavourites: () => void;
}

export const TrackSettings: React.FC<TrackSettingsProps> = ({
    track,
    isEditingEnabled,
    setIsEditingEnabled,
    handleCopyLink,
    handleRemoveFromFavourites
}) => {
    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6 h-full overflow-y-auto pr-2">
                {/* Actions */}
                <div>
                    <h3 className="text-white font-medium mb-2">Actions</h3>
                    <button
                        onClick={handleCopyLink}
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

                {/* Edit Mode */}
                <div>
                    <h3 className="text-white font-medium mb-2">Edit</h3>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm">Enable Editing Mode</span>
                        <button
                            onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                            className={`w-10 h-6 rounded-full relative transition-colors ${isEditingEnabled ? 'bg-[#1DB954]' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isEditingEnabled ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div>
                    <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                    <button
                        onClick={handleRemoveFromFavourites}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group border border-red-500/20 hover:border-red-500/50"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <span className="text-red-500">Remove from Favourites</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
