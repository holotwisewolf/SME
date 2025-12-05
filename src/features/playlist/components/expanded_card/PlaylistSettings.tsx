import React from 'react';

// --- Internal Mocks for Canvas Environment ---

// 1. Mock Spotify Icon Component
const SpotifyIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM17.525 17.294C17.219 17.769 16.6 17.919 16.125 17.625C13.369 15.938 9.881 15.544 5.794 16.481C5.263 16.6 4.731 16.256 4.613 15.725C4.494 15.194 4.838 14.663 5.369 14.544C9.9 13.506 13.781 13.969 16.969 15.919C17.444 16.213 17.594 16.831 17.294 17.294ZM18.988 14.031C18.6 14.631 17.806 14.819 17.206 14.45C14.063 12.519 9.306 11.956 5.581 13.088C4.894 13.3 4.163 12.919 3.95 12.231C3.738 11.544 4.119 10.813 4.806 10.6C9.156 9.275 14.481 9.925 18.156 12.181C18.756 12.55 18.944 13.344 18.569 13.95V14.031ZM19.113 10.638C15.225 8.325 8.85 8.113 5.15 9.238C4.55 9.419 3.919 9.081 3.738 8.481C3.556 7.881 3.894 7.25 4.494 7.069C8.75 5.775 15.756 6.019 20.269 8.7C20.806 9.019 20.988 9.713 20.669 10.25C20.35 10.788 19.65 10.956 19.113 10.638Z" fill={color} />
    </svg>
);

// 2. Mock Error Context
const useError = () => {
    return {
        showError: (msg: string) => console.error("Error Context:", msg)
    };
};

// 3. Mock Service
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
    onColorChange
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
                                <SpotifyIcon size={20} color="#1DB954" />
                                <span className="text-gray-300">Export to Spotify</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>

                        <button
                            onClick={handleCopyPlaylist}
                            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#1DB954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-300">Copy Playlist</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- Edit --- */}
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

                {/* --- Privacy --- */}
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

                {/* --- Danger Zone --- */}
                <div>
                    <h3 className="text-white font-medium mb-2">Danger Zone</h3>
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 border border-solid border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left"
                    >
                        Delete Playlist
                    </button>
                </div>

            </div>
        </div>
    );
};