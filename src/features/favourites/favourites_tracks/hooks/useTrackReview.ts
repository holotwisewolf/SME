import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useError } from '../../../../context/ErrorContext';
import { useSuccess } from '../../../../context/SuccessContext';
import { submitPersonalRating, getPersonalRating } from '../../../ratings/services/rating_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../services/favourites_services';
import { deleteItemRating, getItemRating } from '../../services/item_services';
import { getItemComments, createComment } from '../../../comments/services/comment_services';
import { getItemTags, getCurrentUserItemTags } from '../../../tags/services/tag_services';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';

interface UseTrackReviewProps {
    track: SpotifyTrack;
    onClose: () => void;
    onRemove?: () => void;
    onFavoriteChange?: (isFavorite: boolean) => void;
    onUpdate?: () => void;
}

export const useTrackReview = ({ track, onClose, onRemove, onFavoriteChange, onUpdate }: UseTrackReviewProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    // UI State
    const [activeTab, setActiveTab] = useState<'review' | 'community' | 'settings'>('review');
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    // Data State
    const [userRating, setUserRating] = useState<number>(0);
    const [personalTags, setPersonalTags] = useState<string[]>([]);
    const [communityTags, setCommunityTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [comments, setComments] = useState<any[]>([]);
    const [isFavourite, setIsFavourite] = useState(false);
    const [userName, setUserName] = useState('You');

    // Input State
    const [newTag, setNewTag] = useState('');
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [track.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const [userRatingData, personalTagsData, allTagsData, globalRatingData, commentsData, isFav] = await Promise.all([
                getPersonalRating(user.id, track.id, 'track'),
                getCurrentUserItemTags(track.id, 'track'),
                getItemTags(track.id, 'track'),
                getItemRating(track.id, 'track'),
                getItemComments(track.id, 'track'),
                checkIsFavourite(track.id, 'track')
            ]);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();

            setUserName(profileData?.display_name || profileData?.username || 'You');
            setUserRating(userRatingData?.rating || 0);
            setPersonalTags(personalTagsData.map((tag: { name: string }) => tag.name));
            setCommunityTags(allTagsData.map((tag: { name: string }) => tag.name));
            setRatingData(globalRatingData);
            setComments(commentsData);
            setIsFavourite(isFav);
        } catch (error) {
            console.error('Error loading track data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingClick = async (newRating: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to rate');
                return;
            }

            if (userRating === newRating) {
                await deleteItemRating(track.id, 'track');
                setUserRating(0);
                showSuccess('Rating removed');
            } else {
                setUserRating(newRating);
                await submitPersonalRating(user.id, track.id, 'track', newRating);
                showSuccess(`Rated ${newRating}/5`);
            }

            const updatedRatingData = await getItemRating(track.id, 'track');
            setRatingData(updatedRatingData);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
            showError('Failed to update rating. Please try again.');
        }
    };

    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to add tags');
                return;
            }

            // CRITICAL FIX: Sanitize BEFORE checking/displaying
            const rawTag = newTag.trim();
            const sanitizedTag = rawTag.toLowerCase().replace(/[^a-z]/g, '');

            // Validate sanitized tag is not empty
            if (!sanitizedTag) {
                showError('Tag must contain at least one letter');
                setNewTag('');
                return;
            }

            // Check if sanitized tag already exists (not the raw input)
            if (personalTags.includes(sanitizedTag)) {
                showError('Tag already exists');
                setNewTag('');
                return;
            }

            // Show what the tag will actually be saved as
            if (rawTag !== sanitizedTag) {
                console.log(`Tag sanitized: "${rawTag}" → "${sanitizedTag}"`);
            }

            try {
                const { addItemTag } = await import('../../services/item_services');

                // Add to database (this will sanitize again server-side)
                await addItemTag(track.id, 'track', sanitizedTag);

                // IMPORTANT: Add the SANITIZED version to UI state, not the raw input
                setPersonalTags([...personalTags, sanitizedTag]);

                if (!communityTags.includes(sanitizedTag)) {
                    setCommunityTags([...communityTags, sanitizedTag]);
                }

                setNewTag('');
                showSuccess(`Tag #${sanitizedTag} added`);
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error('Error adding tag:', error);
                showError('Failed to add tag');
            }
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const prevTags = [...personalTags];
        setPersonalTags(personalTags.filter(tag => tag !== tagToRemove));

        try {
            const { removeItemTag } = await import('../../services/item_services');
            await removeItemTag(track.id, 'track', tagToRemove);
            showSuccess(`Tag #${tagToRemove} removed`);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error removing tag:', error);
            setPersonalTags(prevTags);
            showError('Failed to remove tag');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            await createComment(track.id, 'track', newComment);
            setNewComment('');
            const updatedComments = await getItemComments(track.id, 'track');
            setComments(updatedComments);
        } catch (error: any) {
            console.error('Error adding comment:', error);
            if (error?.message?.includes('row-level security') || error?.code === 'PGRST301') {
                showError('Please sign in to post comments');
            } else {
                showError(error.message || 'Failed to add comment. Please try again.');
            }
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (track.external_urls.spotify) {
            navigator.clipboard.writeText(track.external_urls.spotify);
        }
    };

    const handleToggleFavourite = async () => {
        const willBeFavourite = !isFavourite;
        setIsFavourite(willBeFavourite);
        try {
            if (willBeFavourite) {
                await addToFavourites(track.id, 'track');
                showSuccess('Track added to favourites');
            } else {
                await removeFromFavourites(track.id, 'track');
                showSuccess('Track removed from favourites');
                if (onRemove) {
                    onRemove();
                    onClose();
                }
            }
            // Notify parent component of the change
            if (onFavoriteChange) {
                onFavoriteChange(willBeFavourite);
            }
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite);
            showError('Failed to update favourite status');
        }
    };

    return {
        // State
        activeTab, setActiveTab,
        imgError, setImgError,
        loading,
        isTagMenuOpen, setIsTagMenuOpen,
        showPlaylistModal, setShowPlaylistModal,
        userRating,
        personalTags,
        communityTags,
        ratingData,
        comments,
        isFavourite,
        userName,
        newTag, setNewTag,
        newComment, setNewComment,
        commentLoading,

        // Handlers
        handleRatingClick,
        handleAddTag,
        removeTag,
        handleAddComment,
        handleCopyLink,
        handleToggleFavourite,
    };
};
