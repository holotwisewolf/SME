import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { getAlbum, getAlbumTracks } from '../../../spotify/services/spotify_services';
import { getItemTags, getCurrentUserItemTags } from '../../../tags/services/tag_services';
import { getItemRating, getUserItemRating, getItemComments, addItemComment } from '../../services/item_services';
import { removeFromFavourites, addToFavourites, checkIsFavourite } from '../../services/favourites_services';
import { useError } from '../../../../context/ErrorContext';
import { useSuccess } from '../../../../context/SuccessContext';

export type ActiveTab = 'tracks' | 'review' | 'community' | 'settings';

interface UseExpandedAlbumProps {
    albumId: string;
    onClose?: () => void;
    onRemove?: () => void;
    onUpdate?: () => void;
}


export const useExpandedAlbum = ({ albumId, onClose, onRemove, onUpdate }: UseExpandedAlbumProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    // --- State ---
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
    const [loading, setLoading] = useState(true);

    // Data
    const [album, setAlbum] = useState<any>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [personalTags, setPersonalTags] = useState<string[]>([]);
    const [communityTags, setCommunityTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [userName, setUserName] = useState('You');
    const [comments, setComments] = useState<any[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Interaction
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ name: string; trackIds: string[] } | null>(null);
    const [isFavourite, setIsFavourite] = useState(false);

    // Derived
    const filteredTracks = tracks.filter(track =>
        (track.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artists?.some((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // --- Effects ---
    useEffect(() => {
        loadData();
        checkIsFavourite(albumId, 'album').then(setIsFavourite);
    }, [albumId]);

    // --- Logic ---
    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const [albumData, tracksData, commentsData] = await Promise.all([
                getAlbum(albumId),
                getAlbumTracks(albumId),
                getItemComments(albumId, 'album')
            ]);

            setAlbum(albumData);
            setTracks(tracksData.items || tracksData || []);
            setComments(commentsData);

            const [personalTagsData, allTagsData, ratingRes, userRatingRes] = await Promise.all([
                user ? getCurrentUserItemTags(albumId, 'album') : Promise.resolve([]),
                getItemTags(albumId, 'album'),
                getItemRating(albumId, 'album'),
                user ? getUserItemRating(albumId, 'album') : Promise.resolve(null)
            ]);

            setPersonalTags(personalTagsData.map((tag: { name: string }) => tag.name));
            setCommunityTags(allTagsData.map((tag: { name: string }) => tag.name));
            setRatingData(ratingRes);
            setUserRating(userRatingRes);

            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('display_name, username')
                    .eq('id', user.id)
                    .single();
                setUserName(profileData?.display_name || profileData?.username || 'You');
            } else {
                setUserName('You');
            }

        } catch (error: any) {
            console.error('Error loading album details:', error);
            if (error?.message?.includes('404') || error?.message?.includes('not found')) {
                showError('This album is no longer available on Spotify');
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2000);
            } else {
                showError('Failed to load album details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRatingUpdate = async () => {
        const [ratingRes, userRatingRes] = await Promise.all([
            getItemRating(albumId, 'album'),
            getUserItemRating(albumId, 'album')
        ]);
        setRatingData(ratingRes);
        setUserRating(userRatingRes);
        if (onUpdate) onUpdate();
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await addItemComment(albumId, 'album', newComment);
            showSuccess('Comment posted');
            setNewComment('');
            const commentsData = await getItemComments(albumId, 'album');
            setComments(commentsData);
            if (onUpdate) onUpdate();
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

    const handleToggleFavourite = async () => {
        const willBeFavourite = !isFavourite;
        setIsFavourite(willBeFavourite);
        try {
            if (willBeFavourite) {
                await addToFavourites(albumId, 'album');
                showSuccess('Album added to favourites');
                if (onUpdate) onUpdate();
            } else {
                await removeFromFavourites(albumId, 'album');
                showSuccess('Album removed from favourites');
                if (onRemove) onRemove();
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite);
            showError('Failed to update favourite status');
        }
    };

    const handleRemoveFromFavourites = async () => {
        if (window.confirm('Remove this album from your favourites?')) {
            try {
                await removeFromFavourites(albumId, 'album');
                setIsFavourite(false);
                showSuccess('Album removed from favourites');
                if (onRemove) onRemove();
                if (onClose) onClose();
            } catch (error) {
                console.error('Error removing from favourites:', error);
                showError('Failed to remove album');
            }
        }
    };

    const handleImportToPlaylist = () => {
        if (tracks.length > 0) {
            const trackIds = tracks.map((t: any) => t.id).filter(Boolean);
            setPlaylistModalTrack({
                name: album?.name || 'Album',
                trackIds: trackIds
            });
        }
    };

    return {
        // State
        activeTab, setActiveTab,
        loading,
        album,
        filteredTracks,
        personalTags, setPersonalTags,
        communityTags,
        ratingData,
        userRating,
        userName,
        comments,
        selectedTrack, setSelectedTrack,
        searchQuery, setSearchQuery,
        newComment, setNewComment,
        commentLoading,
        playlistModalTrack, setPlaylistModalTrack,
        isFavourite,

        // Handlers
        handleRatingUpdate,
        handleAddComment,
        handleToggleFavourite,
        handleRemoveFromFavourites,
        handleImportToPlaylist,
    };
};
