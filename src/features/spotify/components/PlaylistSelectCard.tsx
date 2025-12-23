import { useState, useEffect } from 'react';
import { getUserPlaylists, createPlaylist, addTrackToPlaylist, addTracksToPlaylist, type CreatePlaylistRequest } from '../../playlist/services/playlist_services';
import type { Tables } from '../../../types/supabase';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';

interface PlaylistSelectCardProps {
    trackId?: string;
    trackIds?: string[];
    trackName: string;
    onClose: () => void;
    onPlaylistCreated?: () => void;  // Callback when playlist is created
}

export function PlaylistSelectCard({
    trackId,
    trackIds,
    trackName,
    onClose,
    onPlaylistCreated
}: PlaylistSelectCardProps) {
    const [playlists, setPlaylists] = useState<Tables<'playlists'>[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState('New Playlist');
    const [loading, setLoading] = useState(false);
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    useEffect(() => {
        loadPlaylists();
    }, []);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.playlist-select-modal')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const loadPlaylists = async () => {
        try {
            const data = await getUserPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        setLoading(true);
        try {
            // Check if user is authenticated
            const { supabase } = await import('../../../lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('You must be logged in to create a playlist.');
                setLoading(false);
                return;
            }

            const request: CreatePlaylistRequest = {
                name: newPlaylistName,
                is_public: true
            };
            const newPlaylist = await createPlaylist(request);

            if (trackIds && trackIds.length > 0) {
                await addTracksToPlaylist({ playlistId: newPlaylist.id, trackIds });
            } else if (trackId) {
                await addTrackToPlaylist({ playlistId: newPlaylist.id, trackId });
            }

            showSuccess(`Created playlist "${newPlaylist.title}"`);

            // Refresh the modal's own playlist list
            await loadPlaylists();

            // Notify parent components (Dashboard, etc.) to refresh
            onPlaylistCreated?.();
            window.dispatchEvent(new Event('playlist-updated'));

            // onClose(); // Keep open as requested
        } catch (error) {
            console.error('Error creating playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlaylist = async (playlistId: string) => {
        setLoading(true);
        try {
            if (trackIds && trackIds.length > 0) {
                await addTracksToPlaylist({ playlistId, trackIds });
                showSuccess('Tracks added to playlist');
            } else if (trackId) {
                await addTrackToPlaylist({ playlistId, trackId });
                showSuccess('Track added to playlist');
            }
            // onClose(); // Keep open as requested
        } catch (error: any) {
            console.error('Error adding to playlist:', error);
            // Check if it's a duplicate track error
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('already in playlist') || errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
                showError('This track is already in the playlist');
            } else {
                showError('Failed to add track to playlist');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop with blur effect
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
            {/* UPDATED CARD STYLES:
                - w-[400px]: This sets the width to exactly 400px, matching the other modal.
                - bg-[#1f1f1f]/95: Slightly transparent background.
            */}
            <div className="playlist-select-modal relative w-[400px] max-w-full bg-[#1f1f1f]/95 rounded-lg shadow-2xl border border-[#333] p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Add to Playlist</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-400 mb-4">Adding: {trackName}</p>

                {/* Create New Playlist */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Create New Playlist</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="flex-1 bg-[#282828] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f8baba] border border-transparent focus:border-[#f8baba]/50"
                            placeholder="Playlist name"
                        />
                        <button
                            onClick={handleCreatePlaylist}
                            disabled={loading || !newPlaylistName.trim()}
                            className="bg-[#f8baba] hover:bg-[#FFD1D1] text-black font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-4"></div>

                {/* Existing Playlists */}
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Choose Existing Playlist</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {playlists.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No playlists found</p>
                        ) : (
                            playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleSelectPlaylist(playlist.id)}
                                    disabled={loading}
                                    className="w-full text-left px-4 py-3 bg-[#282828] hover:bg-[#333333] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#ffffff]/10"
                                >
                                    <div className="text-white font-medium">{playlist.title}</div>
                                    <div className="text-xs text-gray-400">{playlist.track_count} tracks</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}