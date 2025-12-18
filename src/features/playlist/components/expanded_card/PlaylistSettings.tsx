import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';

// --- Internal Mocks for Canvas Environment ---

// 1. Mock Error Context
const useError = () => {
    return {
        showError: (msg: string) => console.error("Error Context:", msg)
    };
};

// 2. Mock Service
const updatePlaylistPublicStatus = async (id: string, status: boolean) => {
    console.log(`[Mock Service] Playlist ${id} public status updated to: ${status}`);
    return new Promise(resolve => setTimeout(resolve, 300));
};

// --- End Mocks ---

interface PlaylistSettingsProps {
    playlistId: string;
    handleExportToSpotify: () => void;
    handleCopyPlaylist: () => void;
    isEditingEnabled: boolean;
    setIsEditingEnabled: (enabled: boolean) => void;
    isPublic: boolean;
    onPublicStatusChange: (isPublic: boolean) => void;
    onDelete?: () => void;
    color?: string;
    onColorChange: (color: string) => void;
    isOwner?: boolean;
    isFavourite?: boolean;
    onToggleFavourite?: () => void;
}

const PRESET_COLORS = [
    '#09090B', // Zinc 950 (Rich Black)
    '#FFD1D1', // Pastel Blush (Your Custom)
    '#1DB954', // Spotify Green (Brand)
    '#6366F1', // Indigo (Modern Blue replacement)
    '#A855F7', // Vivid Purple
    '#D946EF', // Fuchsia (Modern Pink)
    '#F43F5E', // Rose (Modern Red)
    '#FB923C', // Orange (Softer, vibrant)
    '#FACC15', // Sunshine Yellow
    '#2DD4BF', // Mint Teal
];

export const PlaylistSettings: React.FC<PlaylistSettingsProps> = ({
    playlistId,
    handleExportToSpotify,
    handleCopyPlaylist,
    isEditingEnabled,
    setIsEditingEnabled,
    isPublic,
    onPublicStatusChange,
    onDelete,
    color,
    onColorChange,
    isOwner = false,
    isFavourite,
    onToggleFavourite
}) => {
    const { showError } = useError();

    const handlePublicToggle = async () => {
        try {
            const newStatus = !isPublic;
            await updatePlaylistPublicStatus(playlistId, newStatus);
            onPublicStatusChange(newStatus);
        } catch (error) {
            console.error('Error updating public status:', error);
            showError('Failed to update public status');
        }
    };

    return (
        <div className="flex-1 min-h-0">
            {/* Added pb-6 to prevent scrollbar jitter when hovering last item */}
            <div className="space-y-6 h-full overflow-y-auto pr-2 pb-6">

                {/* --- Actions --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={handleExportToSpotify}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <ExternalLink className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Export to Spotify</span>
                            </div>
                        </button>

                        <button
                            onClick={handleCopyPlaylist}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Copy className="w-5 h-5 text-[#1DB954]" />
                                <span className="text-gray-300">Copy Playlist</span>
                            </div>
                        </button>

                        {/* Add to Favourites - Only visible for playlist owner */}
                        {isOwner && (
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
                        )}
                    </div>
                </div>

                {/* --- Edit --- */}
                {isOwner && (
                    <div>
                        <h3 className="text-white font-medium mb-2">Edit</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300 text-sm">Enable Editing Mode</span>
                                <button
                                    onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${isEditingEnabled ? 'bg-[#1DB954]' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isEditingEnabled ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300 text-sm block mb-3">Playlist Color</span>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((presetColor) => (
                                        <button
                                            key={presetColor}
                                            onClick={() => onColorChange(presetColor)}
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === presetColor ? 'ring-2 ring-white scale-110' : ''}`}
                                            style={{ backgroundColor: presetColor }}
                                            title={presetColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Privacy --- */}
                {isOwner && (
                    <div>
                        <h3 className="text-white font-medium mb-2">Privacy</h3>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-gray-300 text-sm">Public Playlist</span>
                            <button
                                onClick={handlePublicToggle}
                                className={`w-10 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-[#1DB954]' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isPublic ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Danger Zone (only for owner) --- */}
                {isOwner && (
                    <div>
                        <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                        {/* Remove from Favourites (If is favourite) */}
                        <button
                            onClick={onToggleFavourite}
                            disabled={!isFavourite || !onToggleFavourite}
                            className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            Remove from Favourites
                        </button>

                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left"
                            >
                                Delete Playlist
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};