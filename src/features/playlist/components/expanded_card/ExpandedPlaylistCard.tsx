import React, { useState, useEffect } from 'react';
import type { Tables } from '../../../../types/supabase';
import { supabase } from '../../../../lib/supabaseClient';
import {
    fetchPlaylistTracksWithDetails,
    getPlaylistTags,
    getPlaylistRating,
    getPlaylistComments,
    addPlaylistComment,
    updatePlaylistTitle,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    updatePlaylistPublicStatus,
    getUserPlaylistRating,
    deletePlaylist,
    updatePlaylistColor
} from '../../services/playlist_services';
import { getProfile, getSession } from '../../../auth/services/auth_services';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { useError } from '../../../../context/ErrorContext';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTracks } from './PlaylistTracks';
import { PlaylistCommunity } from './PlaylistCommunity';
import { PlaylistSettings } from './PlaylistSettings';
import ExpandButton from '../../../../components/ui/ExpandButton';
import { PlaylistTrackDetailModal } from './PlaylistTrackDetailModal';

interface ExpandedPlaylistCardProps {
    playlist: Tables<'playlists'>;
    onClose?: () => void;
    onTitleChange?: (newTitle: string) => void;
    currentTitle?: string;
    onDeletePlaylist?: () => void;
    onColorChange?: (newColor: string) => void;
}

type ActiveTab = 'tracks' | 'community' | 'settings';

export const ExpandedPlaylistCard: React.FC<ExpandedPlaylistCardProps> = ({ playlist, onClose, onTitleChange, currentTitle, onDeletePlaylist, onColorChange }) => {
    const { showError } = useError();
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data States
    const [tracks, setTracks] = useState<any[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [creatorName, setCreatorName] = useState<string>('Unknown');
    const [playlistTitle, setPlaylistTitle] = useState(currentTitle ?? playlist.title);
    const [isPublic, setIsPublic] = useState(playlist.is_public || false);
    const [playlistColor, setPlaylistColor] = useState<string | undefined>(playlist.color || undefined);

    // Interaction States
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isEditingEnabled, setIsEditingEnabled] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTracks = tracks.filter(track =>
        (track.details?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.details?.artists?.some((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Image URL logic
    const playlistImgUrl = supabase.storage.from('playlists').getPublicUrl(playlist.id).data.publicUrl;

    useEffect(() => {
        loadData();
    }, [playlist.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tracksData, tagsData, ratingRes, userRatingRes, commentsData, profileData] = await Promise.all([
                fetchPlaylistTracksWithDetails(playlist.id),
                getPlaylistTags(playlist.id),
                getPlaylistRating(playlist.id),
                getUserPlaylistRating(playlist.id),
                getPlaylistComments(playlist.id),
                getProfile(playlist.user_id)
            ]);

            setTracks(tracksData);
            setTags(tagsData);
            setRatingData(ratingRes);
            setUserRating(userRatingRes);
            setComments(commentsData);
            if (profileData) {
                setCreatorName(profileData.username || profileData.display_name || 'Unknown');
            }
        } catch (error) {
            console.error('Error loading playlist details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTitleUpdate = async () => {
        if (!playlistTitle.trim() || playlistTitle === playlist.title) {
            setIsEditingTitle(false);
            return;
        }

        // Optimistic update
        setIsEditingTitle(false);

        try {
            await updatePlaylistTitle(playlist.id, playlistTitle);
            if (onTitleChange) {
                onTitleChange(playlistTitle);
            }
            // Success - no further action needed as local state is already updated
        } catch (error) {
            console.error('Error updating title:', error);
            showError('Failed to update title');
            // Revert on error
            setPlaylistTitle(playlist.title);
            setIsEditingTitle(true); // Re-open edit mode so user can try again
        }
    };

    const handleRatingUpdate = async () => {
        const [ratingRes, userRatingRes] = await Promise.all([
            getPlaylistRating(playlist.id),
            getUserPlaylistRating(playlist.id)
        ]);
        setRatingData(ratingRes);
        setUserRating(userRatingRes);
    };

    const handleRemoveTrack = async (trackId: string) => {
        try {
            await removeTrackFromPlaylist(playlist.id, trackId);
            setTracks(tracks.filter(t => t.spotify_track_id !== trackId));
        } catch (error) {
            console.error('Error removing track:', error);
        }
    };

    const handleReorderTracks = async (newOrder: any[]) => {
        // Optimistic update
        setTracks(newOrder);
        try {
            const updates = newOrder.map((track, index) => ({
                id: track.id,
                position: index
            }));
            await reorderPlaylistTracks(updates);
        } catch (error) {
            console.error('Error reordering tracks:', error);
            loadData(); // Revert on error
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await addPlaylistComment(playlist.id, newComment);
            setNewComment('');
            const commentsData = await getPlaylistComments(playlist.id);
            setComments(commentsData);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handlePublicStatusChange = async (newStatus: boolean) => {
        try {
            await updatePlaylistPublicStatus(playlist.id, newStatus);
            setIsPublic(newStatus);
        } catch (error) {
            console.error('Error updating public status:', error);
            setIsPublic(!newStatus); // Revert
        }
    };

    const handleColorChange = async (newColor: string) => {
        // Optimistic update
        const oldColor = playlistColor;
        setPlaylistColor(newColor);
        if (onColorChange) {
            onColorChange(newColor);
        }
        try {
            await updatePlaylistColor(playlist.id, newColor);
        } catch (error) {
            console.error('Error updating playlist color:', error);
            setPlaylistColor(oldColor); // Revert
            if (onColorChange && oldColor) {
                onColorChange(oldColor);
            }
        }
    };

    const handleExportToSpotify = async () => {
        try {
            const session = await getSession();
            if (!session) {
                showError('You must be logged in to export.');
                return;
            }

            const profile = await getProfile(session.user.id);
            if (!profile?.spotify_connected) {
                showError('Please link your Spotify account in settings to export.');
                return;
            }

            // Placeholder for future implementation
            showError('Export to Spotify feature coming soon!');
        } catch (error) {
            console.error('Error checking Spotify status:', error);
            showError('Failed to verify Spotify connection.');
        }
    };

    const handleCopyPlaylist = () => {
        // Placeholder for future implementation
        showError('Copy playlist feature coming soon!');
    };

    const handleDeletePlaylist = async () => {
        if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            try {
                // Perform the deletion
                await deletePlaylist(playlist.id);

                // Call the parent's onDelete handler if provided (to refresh the list)
                if (onDeletePlaylist) {
                    onDeletePlaylist();
                }
                if (onClose) {
                    onClose();
                }
            } catch (error) {
                console.error('Error deleting playlist:', error);
                showError('Failed to delete playlist');
            }
        }
    };

    const handleTrackClick = (track: any) => {
        setSelectedTrack(track);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto" onClick={(e) => e.stopPropagation()}>
                    <LoadingSpinner className="w-12 h-12 text-[white]" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="flex flex-col md:flex-row bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl mx-auto border border-white/5 relative h-[515px]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: playlistColor
                        ? `linear-gradient(135deg, ${playlistColor}20 0%, #1e1e1e 100%)`
                        : '#1e1e1e'
                }}
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <ExpandButton
                        onClick={onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                    />
                </div>

                {/* Left Column - Header */}
                <PlaylistHeader
                    playlistId={playlist.id}
                    creatorName={creatorName}
                    playlistImgUrl={playlistImgUrl}
                    imgError={imgError}
                    setImgError={setImgError}
                    ratingData={ratingData}
                    userRating={userRating}
                    tags={tags}
                    isEditingTitle={isEditingTitle}
                    setIsEditingTitle={setIsEditingTitle}
                    playlistTitle={playlistTitle}
                    setPlaylistTitle={setPlaylistTitle}
                    handleTitleUpdate={handleTitleUpdate}
                    isEditingEnabled={isEditingEnabled}
                    onRatingUpdate={handleRatingUpdate}
                />

                {/* Right Column */}
                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                        {(['tracks', 'community', 'settings'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    {activeTab === 'tracks' && (
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search in playlist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#151515]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Content Panel */}
                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">
                        {activeTab === 'tracks' && (
                            <PlaylistTracks
                                tracks={filteredTracks}
                                isEditingEnabled={isEditingEnabled}
                                onRemoveTrack={handleRemoveTrack}
                                onReorderTracks={handleReorderTracks}
                                onTrackClick={handleTrackClick}
                            />
                        )}

                        {activeTab === 'community' && (
                            <PlaylistCommunity
                                comments={comments}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                handleAddComment={handleAddComment}
                                commentLoading={commentLoading}
                                ratingData={ratingData}
                                tags={tags}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <PlaylistSettings
                                playlistId={playlist.id}
                                handleExportToSpotify={handleExportToSpotify}
                                handleCopyPlaylist={handleCopyPlaylist}
                                isEditingEnabled={isEditingEnabled}
                                setIsEditingEnabled={setIsEditingEnabled}
                                isPublic={isPublic}
                                onPublicStatusChange={handlePublicStatusChange}
                                onDelete={handleDeletePlaylist}
                                color={playlistColor}
                                onColorChange={handleColorChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Track Detail Modal */}
            {
                selectedTrack && (
                    <PlaylistTrackDetailModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                    />
                )
            }
        </div >
    );
};
