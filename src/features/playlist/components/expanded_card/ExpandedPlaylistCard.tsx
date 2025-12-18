import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // [修复1] 引入 createPortal
import type { Tables } from '../../../../types/supabase';
import { supabase } from '../../../../lib/supabaseClient';
import {
    fetchPlaylistTracksWithDetails,
    getPlaylistRating,
    getPlaylistComments,
    addPlaylistComment,
    updatePlaylistTitle,
    removeTrackFromPlaylist,
    updatePlaylistPublicStatus,
    getUserPlaylistRating,
    deletePlaylist,
    updatePlaylistColor,
    reorderPlaylistTracks
} from '../../services/playlist_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../../favourites/services/favourites_services';
import { getItemTags, getCreatorItemTags } from '../../../tags/services/tag_services';
import { getProfile, getSession } from '../../../auth/services/auth_services';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { useError } from '../../../../context/ErrorContext';
import { useSuccess } from '../../../../context/SuccessContext';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTracks } from './PlaylistTracks';
import { PlaylistCommunity } from './PlaylistCommunity';
import { PlaylistSettings } from './PlaylistSettings';
import { PlaylistReview } from './PlaylistReview';
import ExpandButton from '../../../../components/ui/ExpandButton';
import { TrackReviewModal } from '../../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal'; 
import type { EnhancedPlaylist } from '../../services/playlist_services';

interface ExpandedPlaylistCardProps {
    playlist: Tables<'playlists'>;
    onClose?: () => void;
    onTitleChange?: (newTitle: string) => void;
    currentTitle?: string;
    onDeletePlaylist?: () => void;
    onColorChange?: (newColor: string) => void;
    currentColor?: string | null;
    onPlaylistUpdate?: (id: string, updates: Partial<EnhancedPlaylist>) => void;
}

type ActiveTab = 'tracks' | 'review' | 'community' | 'settings';

export const ExpandedPlaylistCard: React.FC<ExpandedPlaylistCardProps> = ({ 
    playlist, onClose, onTitleChange, currentTitle, onDeletePlaylist, onColorChange, currentColor, 
    onPlaylistUpdate 
}) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);

    const [tracks, setTracks] = useState<any[]>([]);
    const [creatorTags, setCreatorTags] = useState<string[]>([]);
    const [userTags, setUserTags] = useState<string[]>([]);
    const [communityTags, setCommunityTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [creatorName, setCreatorName] = useState('Creator');
    const [currentUserName, setCurrentUserName] = useState('You');
    const [playlistTitle, setPlaylistTitle] = useState(currentTitle ?? playlist.title);
    const [isPublic, setIsPublic] = useState(playlist.is_public || false);
    const [playlistColor, setPlaylistColor] = useState<string | undefined>(currentColor || playlist.color || undefined);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isEditingEnabled, setIsEditingEnabled] = useState(false);
    
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null); 
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    useEffect(() => {
        const checkOwnership = async () => {
            const session = await getSession();
            setIsOwner(session?.user?.id === playlist.user_id);
        };
        checkOwnership();
        checkIsFavourite(playlist.id, 'playlist').then(setIsFavourite);
    }, [playlist.user_id, playlist.id]);

    const filteredTracks = tracks.filter(track =>
        (track.details?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.details?.artists?.some((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const playlistImgUrl = supabase.storage.from('playlists').getPublicUrl(playlist.id).data.publicUrl;

    useEffect(() => {
        loadData();
    }, [playlist.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const session = await getSession();
            const currentUserId = session?.user?.id;

            const [tracksData, allTagsData, creatorTagsData, userTagsData, ratingRes, userRatingRes, commentsData, profileData, currentUserProfile] = await Promise.all([
                fetchPlaylistTracksWithDetails(playlist.id),
                getItemTags(playlist.id, 'playlist'),
                getCreatorItemTags(playlist.id, 'playlist', playlist.user_id),
                currentUserId ? getCreatorItemTags(playlist.id, 'playlist', currentUserId) : Promise.resolve([]),
                getPlaylistRating(playlist.id),
                getUserPlaylistRating(playlist.id),
                getPlaylistComments(playlist.id),
                getProfile(playlist.user_id),
                currentUserId ? getProfile(currentUserId) : Promise.resolve(null)
            ]);

            setTracks(tracksData);
            setCreatorTags(creatorTagsData.map(tag => tag.name));
            setUserTags(userTagsData.map(tag => tag.name));
            setCommunityTags(allTagsData.map(tag => tag.name));
            setRatingData(ratingRes);
            setUserRating(userRatingRes);
            setComments(commentsData);
            setCreatorName(profileData?.display_name || profileData?.username || 'Creator');
            setCurrentUserName(currentUserProfile?.display_name || currentUserProfile?.username || 'You');
        } catch (error) {
            console.error('Error loading playlist details:', error);
            showError('Failed to load playlist details');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleUpdate = async () => {
        if (!playlistTitle.trim() || playlistTitle === playlist.title) {
            setIsEditingTitle(false);
            return;
        }
        setIsEditingTitle(false);
        try {
            await updatePlaylistTitle(playlist.id, playlistTitle);
            if (onTitleChange) onTitleChange(playlistTitle);
            showSuccess('Playlist title updated');
        } catch (error) {
            console.error('Error updating title:', error);
            showError('Failed to update title');
            setPlaylistTitle(playlist.title);
            setIsEditingTitle(true);
        }
    };

    const handleRatingUpdate = async () => {
        const [ratingRes, userRatingRes] = await Promise.all([
            getPlaylistRating(playlist.id),
            getUserPlaylistRating(playlist.id)
        ]);
        setRatingData(ratingRes);
        setUserRating(userRatingRes);
        
        if (onPlaylistUpdate) {
            const now = new Date().toISOString();
            onPlaylistUpdate(playlist.id, {
                rating_avg: ratingRes.average,
                rating_count: ratingRes.count,
                rated_at: now,
                user_rating: userRatingRes || 0,
                user_rated_at: now
            });
        }
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
        setTracks(newOrder); 
        try {
            const updates = newOrder.map((track, index) => ({
                id: track.id,
                position: index
            }));
            await reorderPlaylistTracks(updates);
        } catch (error) {
            console.error('Error reordering tracks:', error);
            showError('Failed to save new order');
            loadData(); 
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await addPlaylistComment(playlist.id, newComment);
            showSuccess('Comment posted');
            setNewComment('');
            const commentsData = await getPlaylistComments(playlist.id);
            setComments(commentsData);

            if (onPlaylistUpdate) {
                onPlaylistUpdate(playlist.id, {
                    comment_count: commentsData.length,
                    commented_at: new Date().toISOString()
                });
            }
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
            showSuccess(newStatus ? 'Playlist is now public' : 'Playlist is now private');
        } catch (error) {
            console.error('Error updating public status:', error);
            setIsPublic(!newStatus);
        }
    };

    const handleColorChange = async (newColor: string) => {
        const oldColor = playlistColor;
        setPlaylistColor(newColor);
        if (onColorChange) onColorChange(newColor);
        try {
            await updatePlaylistColor(playlist.id, newColor);
            showSuccess('Playlist color updated');
        } catch (error) {
            console.error('Error updating playlist color:', error);
            setPlaylistColor(oldColor);
            if (onColorChange && oldColor) onColorChange(oldColor);
        }
    };

    const handleExportToSpotify = async () => {
        showError('Export to Spotify feature coming soon!');
    };

    const handleCopyPlaylist = () => {
        showError('Copy playlist feature coming soon!');
    };

    const handleDeletePlaylist = async () => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            try {
                await deletePlaylist(playlist.id);
                showSuccess('Playlist deleted');
                if (onDeletePlaylist) onDeletePlaylist();
                if (onClose) onClose();
            } catch (error) {
                console.error('Error deleting playlist:', error);
                showError('Failed to delete playlist');
            }
        }
    };

    const handleToggleFavourite = async () => {
        const willBeFavourite = !isFavourite;
        setIsFavourite(willBeFavourite);
        try {
            if (willBeFavourite) {
                await addToFavourites(playlist.id, 'playlist');
                showSuccess('Playlist added to favourites');
            } else {
                await removeFromFavourites(playlist.id, 'playlist');
                showSuccess('Playlist removed from favourites');
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite); // Revert
            showError('Failed to update favourite status');
        }
    };

    const handleTrackClick = (track: any) => {
        setSelectedTrack(track);
    };

    const handleTagsSync = (newUserTags: string[]) => {
        const mergedTags = Array.from(new Set([...communityTags, ...newUserTags]));
        setCommunityTags(mergedTags);

        if (onPlaylistUpdate) {
            const now = new Date().toISOString();
            onPlaylistUpdate(playlist.id, {
                tags: mergedTags,
                tag_count: mergedTags.length,
                tagged_at: now,
                user_tags: newUserTags,
                user_tag_count: newUserTags.length,
                user_tagged_at: now
            });
        }
    };

    if (loading) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto" onClick={(e) => e.stopPropagation()}>
                    <LoadingSpinner className="w-12 h-12 text-[white]" />
                </div>
            </div>,
            document.body
        );
    }

    // [修复3] 主内容使用 createPortal
    return createPortal(
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
                <div className="absolute top-4 right-4 z-10">
                    <ExpandButton onClick={onClose} className="rotate-180 hover:bg-white/10 rounded-full p-1" strokeColor="white" title="Collapse" />
                </div>

                <PlaylistHeader
                    playlistId={playlist.id}
                    creatorName={creatorName}
                    playlistImgUrl={playlistImgUrl}
                    imgError={imgError}
                    setImgError={setImgError}
                    ratingData={ratingData}
                    userRating={userRating}
                    tags={creatorTags}
                    isEditingTitle={isEditingTitle}
                    setIsEditingTitle={setIsEditingTitle}
                    playlistTitle={playlistTitle}
                    setPlaylistTitle={setPlaylistTitle}
                    handleTitleUpdate={handleTitleUpdate}
                    isEditingEnabled={isEditingEnabled}
                    onRatingUpdate={handleRatingUpdate}
                    trackCount={tracks.length}
                    isOwner={isOwner}
                />

                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                        {(['tracks', 'review', 'community', 'settings'] as const).map((tab) => (
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

                    {activeTab === 'tracks' && (
                        <div className="mb-4 relative">
                            <input type="text" placeholder="Search in playlist..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#151515]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[white]/40 transition-colors" />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    )}

                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">
                        {activeTab === 'tracks' && (
                            <PlaylistTracks tracks={filteredTracks} isEditingEnabled={isEditingEnabled} onRemoveTrack={handleRemoveTrack} onReorderTracks={handleReorderTracks} onTrackClick={handleTrackClick} />
                        )}

                        {activeTab === 'review' && (
                            <PlaylistReview
                                playlist={playlist}
                                userRating={userRating}
                                tags={userTags}
                                setTags={setUserTags}
                                isEditingEnabled={isEditingEnabled}
                                userName={currentUserName}
                                onDescriptionChange={(newDescription) => { playlist.description = newDescription; }}
                                onTagsUpdate={handleTagsSync}
                                onRatingUpdate={handleRatingUpdate}
                            />
                        )}

                        {activeTab === 'community' && (
                            <PlaylistCommunity comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} commentLoading={commentLoading} ratingData={ratingData} tags={communityTags} />
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
                                isOwner={isOwner}
                                isFavourite={isFavourite}
                                onToggleFavourite={handleToggleFavourite}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* [Resolved] Render Correct Track Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack.details || selectedTrack} // Handle both structure types
                    onClose={() => setSelectedTrack(null)}
                />
            )}

        </div>,
        document.body
    );
};