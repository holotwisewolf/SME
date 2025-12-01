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
    reorderPlaylistTracks
} from '../../services/playlist_services';
import { getProfile } from '../../../auth/services/auth_services';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTracks } from './PlaylistTracks';
import { PlaylistComments } from './PlaylistComments';
import { PlaylistSettings } from './PlaylistSettings';

interface ExpandedPlaylistCardProps {
    playlist: Tables<'playlists'>;
    onClose?: () => void;
}

type ActiveTab = 'tracks' | 'comments' | 'settings';

export const ExpandedPlaylistCard: React.FC<ExpandedPlaylistCardProps> = ({ playlist, onClose }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data States
    const [tracks, setTracks] = useState<any[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [comments, setComments] = useState<any[]>([]);
    const [creatorName, setCreatorName] = useState<string>('Unknown');
    const [playlistTitle, setPlaylistTitle] = useState(playlist.title);

    // Interaction States
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isEditingEnabled, setIsEditingEnabled] = useState(false);

    // Image URL logic
    const playlistImgUrl = supabase.storage.from('playlists').getPublicUrl(playlist.id).data.publicUrl;

    useEffect(() => {
        loadData();
    }, [playlist.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tracksData, tagsData, ratingRes, commentsData, profileData] = await Promise.all([
                fetchPlaylistTracksWithDetails(playlist.id),
                getPlaylistTags(playlist.id),
                getPlaylistRating(playlist.id),
                getPlaylistComments(playlist.id),
                getProfile(playlist.user_id)
            ]);

            setTracks(tracksData);
            setTags(tagsData);
            setRatingData(ratingRes);
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
            setPlaylistTitle(playlist.title);
            return;
        }

        try {
            await updatePlaylistTitle(playlist.id, playlistTitle);
            setIsEditingTitle(false);
        } catch (error) {
            console.error('Error updating title:', error);
            alert('Failed to update title');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            await addPlaylistComment(playlist.id, newComment);
            setNewComment('');
            // Refresh comments
            const updatedComments = await getPlaylistComments(playlist.id);
            setComments(updatedComments);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleExportToSpotify = async () => {
        alert("Export to Spotify feature coming soon!");
    };

    const handleCopyPlaylist = () => {
        alert("Playlist copied to your library!");
    };

    // Public Status State
    const [isPublic, setIsPublic] = useState(playlist.is_public || false);

    const handlePublicStatusChange = (newStatus: boolean) => {
        setIsPublic(newStatus);
    };

    const handleRatingUpdate = async () => {
        const newRating = await getPlaylistRating(playlist.id);
        setRatingData(newRating);
    };

    const handleRemoveTrack = async (trackId: string) => {
        try {
            await removeTrackFromPlaylist(playlist.id, trackId);
            setTracks(prev => prev.filter(t => t.spotify_track_id !== trackId));
        } catch (error) {
            console.error('Error removing track:', error);
            alert('Failed to remove track');
        }
    };

    const handleReorderTracks = async (newOrder: any[]) => {
        setTracks(newOrder); // Optimistic update
        try {
            const updates = newOrder.map((track, index) => ({
                id: track.id,
                position: index + 1
            }));
            await reorderPlaylistTracks(updates);
        } catch (error) {
            console.error('Error reordering tracks:', error);
            // Revert on error (optional, but good practice)
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto">
                <LoadingSpinner className="w-12 h-12 text-[#1DB954]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl mx-auto border border-white/5 relative max-h-[515px]">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Left Column - Header */}
            <PlaylistHeader
                playlistId={playlist.id}
                creatorName={creatorName}
                playlistImgUrl={playlistImgUrl}
                imgError={imgError}
                setImgError={setImgError}
                ratingData={ratingData}
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
            <div className="w-full md:w-[65%] p-6 flex flex-col bg-[#1e1e1e] overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                    {(['tracks', 'comments', 'settings'] as const).map((tab) => (
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

                {/* Content Panel */}
                <div className="flex-1 bg-[#151515] rounded-xl border border-white/5 p-6 shadow-inner min-h-[400px] overflow-hidden flex flex-col">
                    {activeTab === 'tracks' && (
                        <PlaylistTracks
                            tracks={tracks}
                            isEditingEnabled={isEditingEnabled}
                            onRemoveTrack={handleRemoveTrack}
                            onReorderTracks={handleReorderTracks}
                        />
                    )}

                    {activeTab === 'comments' && (
                        <PlaylistComments
                            comments={comments}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            handleAddComment={handleAddComment}
                            commentLoading={commentLoading}
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
