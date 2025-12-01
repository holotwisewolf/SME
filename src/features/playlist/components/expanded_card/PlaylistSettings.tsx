import React from 'react';
import SpotifyIcon from '../../../../components/ui/SpotifyIcon';
import { updatePlaylistPublicStatus } from '../../services/playlist_services';

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
    '#1DB954', // Spotify Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#14B8A6', // Teal
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
    const handlePublicToggle = async () => {
        try {
            const newStatus = !isPublic;
            await updatePlaylistPublicStatus(playlistId, newStatus);
            onPublicStatusChange(newStatus);
        } catch (error) {
            console.error('Error updating public status:', error);
            alert('Failed to update public status');
        }
    };

    return (
        <div className="flex-1 min-h-0">
            <div className="space-y-6 h-full overflow-y-auto pr-2">

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
                        className="px-4 py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm w-full text-left"
                    >
                        Delete Playlist
                    </button>
                </div>

            </div>
        </div>
    );
};