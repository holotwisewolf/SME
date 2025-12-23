import { useState, useEffect } from 'react';
import type { Tables } from '../../../types/supabase';
import { supabase } from '../../../lib/supabaseClient';
import {
    fetchPlaylistTracksWithDetails,
    getPlaylistRating,
    getPlaylistComments,
    addPlaylistComment,
    updatePlaylistTitle,
    removeTrackFromPlaylist,
    updatePlaylistPublicStatus,
    getUserPlaylistRating,
    getPlaylistRatingByUserId,
    deletePlaylist,
    updatePlaylistColor,
    reorderPlaylistTracks,
    copyPlaylist,
    type EnhancedPlaylist
} from '../services/playlist_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';
import { getItemTags, getCreatorItemTags } from '../../tags/services/tag_services';
import { getProfile, getSession } from '../../auth/services/auth_services';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import { exportPlaylistToSpotify, isSpotifyConnected, checkSpotifyTokenValid, refreshSpotifyToken, signInWithSpotify } from '../../spotify/services/spotify_auth';
import { useConfirmation } from '../../../context/ConfirmationContext';
import { parseSpotifyError } from '../../spotify/services/spotifyConnection';

export type ActiveTab = 'tracks' | 'review' | 'community' | 'settings';

interface UseExpandedPlaylistProps {
    playlist: Tables<'playlists'>;
    onClose?: () => void;
    onTitleChange?: (newTitle: string) => void;
    currentTitle?: string;
    onDeletePlaylist?: () => void;
    onColorChange?: (newColor: string) => void;
    currentColor?: string | null;
    onPlaylistUpdate?: (id: string, updates: Partial<EnhancedPlaylist>) => void;
    onUpdate?: () => void;
    initialTab?: ActiveTab;
}

export const useExpandedPlaylist = ({
    playlist,
    onClose,
    onTitleChange,
    currentTitle,
    onDeletePlaylist,
    onColorChange,
    currentColor,
    onPlaylistUpdate,
    onUpdate,
    initialTab = 'tracks'
}: UseExpandedPlaylistProps) => {
    // --- Context Hooks ---
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const { showConfirmation } = useConfirmation();

    // --- State Management ---
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [imgError, setImgError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>((playlist as any).playlistimg_url || null);
    const [loading, setLoading] = useState(true);

    // Data States
    const [tracks, setTracks] = useState<any[]>([]);
    const [creatorTags, setCreatorTags] = useState<string[]>([]);
    const [userTags, setUserTags] = useState<string[]>([]);
    const [communityTags, setCommunityTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [creatorRating, setCreatorRating] = useState<number | null>(null);
    const [comments, setComments] = useState<any[]>([]);

    // UI States
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
    const [showSpotifyReconnect, setShowSpotifyReconnect] = useState(false);

    // --- Effects ---

    // Check ownership and favorite status on mount
    useEffect(() => {
        const checkOwnership = async () => {
            const session = await getSession();
            setIsOwner(session?.user?.id === playlist.user_id);
        };
        checkOwnership();
        checkIsFavourite(playlist.id, 'playlist').then(setIsFavourite);
    }, [playlist.user_id, playlist.id]);

    // Use local state for image URL to enable real-time updates
    const playlistImgUrl = imageUrl
        ? `${imageUrl}?t=${Date.now()}`
        : supabase.storage.from('playlists').getPublicUrl(playlist.id).data.publicUrl;

    // Handle image updates
    const handleImageUpdate = async () => {
        const { data: updatedPlaylist } = await supabase
            .from('playlists')
            .select('playlistimg_url')
            .eq('id', playlist.id)
            .single();

        const newUrl = updatedPlaylist?.playlistimg_url || null;
        setImageUrl(newUrl);

        if (!newUrl) {
            setImgError(true);
        } else {
            setImgError(false);
        }

        if (onPlaylistUpdate) {
            onPlaylistUpdate(playlist.id, { playlistimg_url: newUrl });
        }
        if (onUpdate) onUpdate();
    };

    // Load data
    useEffect(() => {
        loadData();
    }, [playlist.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const session = await getSession();
            const currentUserId = session?.user?.id;

            const [tracksData, allTagsData, creatorTagsData, userTagsData, ratingRes, userRatingRes, creatorRatingRes, commentsData, profileData, currentUserProfile] = await Promise.all([
                fetchPlaylistTracksWithDetails(playlist.id),
                getItemTags(playlist.id, 'playlist'),
                getCreatorItemTags(playlist.id, 'playlist', playlist.user_id),
                currentUserId ? getCreatorItemTags(playlist.id, 'playlist', currentUserId) : Promise.resolve([]),
                getPlaylistRating(playlist.id),
                getUserPlaylistRating(playlist.id),
                getPlaylistRatingByUserId(playlist.id, playlist.user_id),
                getPlaylistComments(playlist.id),
                getProfile(playlist.user_id),
                currentUserId ? getProfile(currentUserId) : Promise.resolve(null)
            ]);

            setTracks(tracksData);
            setCreatorTags(creatorTagsData.map((tag: { name: string }) => tag.name));
            setUserTags(userTagsData.map((tag: { name: string }) => tag.name));
            setCommunityTags(allTagsData.map((tag: { name: string }) => tag.name));
            setRatingData(ratingRes);
            setUserRating(userRatingRes);
            setCreatorRating(creatorRatingRes);
            setComments(commentsData);
            setCreatorName(profileData?.display_name || profileData?.username || 'Creator');
            setCurrentUserName(currentUserProfile?.display_name || currentUserProfile?.username || 'You');
        } catch (error) {
            console.error('Error loading playlist details:', error);
            const msg = parseSpotifyError(error, 'Failed to load playlist details');
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Filter tracks
    const filteredTracks = tracks.filter(track =>
        (track.details?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.details?.artists?.some((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // --- Handlers ---

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
        if (onUpdate) onUpdate();
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
        } catch (error: any) {
            console.error('Error adding comment:', error);
            if (error?.message?.includes('row-level security') || error?.code === 'PGRST301') {
                showError('Please sign in to post comments');
            } else {
                showError('Failed to post comment');
            }
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

    const executeSpotifyExport = async () => {
        const trackSpotifyIds = tracks
            .map(t => t.spotify_track_id)
            .filter((id): id is string => !!id);

        if (trackSpotifyIds.length === 0) {
            showError('No tracks to export');
            return;
        }

        const result = await exportPlaylistToSpotify(
            playlist.title || 'Untitled Playlist',
            playlist.description,
            trackSpotifyIds
        );

        if (result.success) {
            showSuccess(`Playlist exported to Spotify!${result.playlistUrl ? ' Opening...' : ''}`);
            if (result.playlistUrl) {
                window.open(result.playlistUrl, '_blank');
            }
        } else {
            showError(result.error || 'Failed to export playlist');
        }
    };

    const handleExportToSpotify = async () => {
        const confirmed = await showConfirmation({
            title: 'Export to Spotify',
            message: `Export "${playlist.title}" to your Spotify account? This will create a new playlist.`,
            confirmText: 'Export',
            variant: 'primary'
        });
        if (!confirmed) return;

        try {
            const connected = await isSpotifyConnected();
            if (!connected) {
                showError('Please connect your Spotify account first.');
                return;
            }

            const tokenValid = await checkSpotifyTokenValid();
            if (!tokenValid) {
                const refreshed = await refreshSpotifyToken();
                if (!refreshed) {
                    setShowSpotifyReconnect(true);
                    return;
                }
            }

            await executeSpotifyExport();
        } catch (error: any) {
            console.error('Error exporting to Spotify:', error);
            showError(error.message || 'Failed to export playlist to Spotify');
        }
    };

    const handleSpotifyReconnect = async (): Promise<boolean> => {
        const success = await refreshSpotifyToken();
        if (success) {
            showSuccess('Spotify reconnected! You can now export.');
            await executeSpotifyExport();
        }
        return success;
    };

    const handleCopyPlaylist = async () => {
        const confirmed = await showConfirmation({
            title: 'Copy Playlist',
            message: `Create a copy of "${playlist.title}" in your library?`,
            confirmText: 'Copy',
            variant: 'primary'
        });
        if (!confirmed) return;

        try {
            const newPlaylist = await copyPlaylist(playlist.id);
            showSuccess(`Playlist copied as "${newPlaylist.title}"`);
            // Trigger silent reload to show the new playlist
            window.dispatchEvent(new Event('playlist-updated'));
        } catch (error) {
            console.error('Error copying playlist:', error);
            showError('Failed to copy playlist');
        }
    };

    const handleDeletePlaylist = async () => {
        const confirmed = await showConfirmation({
            title: 'Delete Playlist',
            message: `Are you sure you want to delete "${playlist.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            await deletePlaylist(playlist.id);
            showSuccess('Playlist deleted');
            if (onDeletePlaylist) onDeletePlaylist();
            if (onClose) onClose();
        } catch (error) {
            console.error('Error deleting playlist:', error);
            showError('Failed to delete playlist');
        }
    };

    const handleToggleFavourite = async () => {
        const willBeFavourite = !isFavourite;

        if (!willBeFavourite) {
            const confirmed = await showConfirmation({
                title: 'Remove from Favourites',
                message: `Remove "${playlist.title}" from your favourites?`,
                confirmText: 'Remove',
                variant: 'danger'
            });
            if (!confirmed) return;

            setIsFavourite(false);
            try {
                await removeFromFavourites(playlist.id, 'playlist');
                showSuccess('Playlist removed from favourites');
            } catch (error) {
                console.error('Error removing from favourites:', error);
                setIsFavourite(true);
                showError('Failed to remove from favourites');
            }
            return;
        }

        setIsFavourite(true);
        try {
            await addToFavourites(playlist.id, 'playlist');
            showSuccess('Playlist added to favourites');
        } catch (error) {
            console.error('Error adding to favourites:', error);
            setIsFavourite(false);
            showError('Failed to add to favourites');
        }
        if (onUpdate) onUpdate();
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
        if (onUpdate) onUpdate();
    };

    return {
        // State
        activeTab, setActiveTab,
        imgError, setImgError,
        playlistImgUrl,
        loading,
        filteredTracks,
        creatorTags,
        userTags, setUserTags,
        communityTags,
        ratingData,
        userRating,
        creatorRating,
        comments,
        creatorName,
        currentUserName,
        playlistTitle, setPlaylistTitle,
        isPublic,
        playlistColor,
        isEditingTitle, setIsEditingTitle,
        newComment, setNewComment,
        commentLoading,
        isEditingEnabled, setIsEditingEnabled,
        selectedTrack, setSelectedTrack,
        searchQuery, setSearchQuery,
        isOwner,
        isFavourite,
        showSpotifyReconnect, setShowSpotifyReconnect,

        // Handlers
        handleImageUpdate,
        handleTitleUpdate,
        handleRatingUpdate,
        handleRemoveTrack,
        handleReorderTracks,
        handleAddComment,
        handlePublicStatusChange,
        handleColorChange,
        handleExportToSpotify,
        handleSpotifyReconnect,
        handleCopyPlaylist,
        handleDeletePlaylist,
        handleToggleFavourite,
        handleTagsSync,
        signInWithSpotify,
        onUpdate
    };
};
