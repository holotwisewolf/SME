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
}

export const PlaylistSettings: React.FC<PlaylistSettingsProps> = ({
    playlistId,
    handleExportToSpotify,
    handleCopyPlaylist,
    isEditingEnabled,
    setIsEditingEnabled,
    isPublic,
    onPublicStatusChange
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
        <div className="space-y-4">
            {/* Toggles Section */}
            <div className="space-y-2">
                {/* Editing Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg border border-white/5">
                    <div>
                        <h3 className="text-white font-medium mb-0.5 text-sm">Enable Editing Mode</h3>
                        <p className="text-xs text-gray-400">Allow changes to playlist details</p>
                    </div>
                    <button
                        onClick={() => setIsEditingEnabled(!isEditingEnabled)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isEditingEnabled ? 'bg-[#1DB954]' : 'bg-gray-600'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${isEditingEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* Public Playlist Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg border border-white/5">
                    <div>
                        <h3 className="text-white font-medium mb-0.5 text-sm">Public Playlist</h3>
                        <p className="text-xs text-gray-400">Visible to other users</p>
                    </div>
                    <button
                        onClick={handlePublicToggle}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isPublic ? 'bg-[#1DB954]' : 'bg-gray-600'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${isPublic ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <button
                    onClick={handleExportToSpotify}
                    className="w-full p-3 bg-[#2a2a2a] hover:bg-[#333] rounded-lg border border-white/5 flex items-center gap-3 group transition-all"
                >
                    <div className="p-1.5 bg-[#1DB954]/10 rounded-full group-hover:bg-[#1DB954]/20 transition-colors">
                        <SpotifyIcon size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-white font-medium text-sm">Export to Spotify</h3>
                        <p className="text-[10px] text-gray-400">Sync to your Spotify account</p>
                    </div>
                </button>

                <button
                    onClick={handleCopyPlaylist}
                    className="w-full p-3 bg-[#2a2a2a] hover:bg-[#333] rounded-lg border border-white/5 flex items-center gap-3 group transition-all"
                >
                    <div className="p-1.5 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h3 className="text-white font-medium text-sm">Copy Playlist</h3>
                        <p className="text-[10px] text-gray-400">Duplicate to your library</p>
                    </div>
                </button>
            </div>

            <div>
                <h3 className="text-white font-medium mb-1 text-sm">Danger Zone</h3>
                <button className="px-3 py-1.5 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-xs w-full text-left">
                    Delete Playlist
                </button>
            </div>
        </div>
    );
};
