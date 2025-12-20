import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';
import { submitPersonalRating, getPersonalRating } from '../../../../ratings/services/rating_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../../services/favourites_services';
import { deleteItemRating } from '../../../services/item_services';
import { getItemComments, createComment } from '../../../../comments/services/comment_services';
import { getItemTags } from '../../../../tags/services/tag_services';
import { supabase } from '../../../../../lib/supabaseClient';
import { useError } from '../../../../../context/ErrorContext';
import { useSuccess } from '../../../../../context/SuccessContext';
import ExpandButton from '../../../../../components/ui/ExpandButton';
import { TrackHeader } from './TrackHeader';
import { TrackReview } from './TrackReview';
import { TrackCommunity } from './TrackCommunity';
import { TrackSettings } from './TrackSettings';
import { PlaylistSelectCard } from '../../../../spotify/components/PlaylistSelectCard';
import { createPortal } from 'react-dom';

interface TrackReviewModalProps {
    track: SpotifyTrack;
    onClose: () => void;
    onRemove?: () => void;
}

// Helper function to get track rating data
async function getTrackRating(trackId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('item_id', trackId)
        .eq('item_type', 'track');

    if (error) throw error;
    if (!data || data.length === 0) return { average: 0, count: 0 };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
        average: sum / data.length,
        count: data.length
    };
}

export const TrackReviewModal: React.FC<TrackReviewModalProps> = ({
    track,
    onClose,
    onRemove
}) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [activeTab, setActiveTab] = useState<'review' | 'community' | 'settings'>('review');
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data States
    const [userRating, setUserRating] = useState<number>(0);
    const [tags, setTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [comments, setComments] = useState<any[]>([]);
    const [isFavourite, setIsFavourite] = useState(false);

    // UI States
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [userName, setUserName] = useState('You');
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

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

            const [userRatingData, tagsData, globalRatingData, commentsData, isFav] = await Promise.all([
                getPersonalRating(user.id, track.id, 'track'),
                getItemTags(track.id, 'track'),
                getTrackRating(track.id),
                getItemComments(track.id, 'track'),
                checkIsFavourite(track.id, 'track')
            ]);

            // Fetch user profile for display name
            const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();

            setUserName(profileData?.display_name || profileData?.username || 'You');
            setUserRating(userRatingData?.rating || 0);
            setTags(tagsData.map(tag => tag.name));
            setRatingData(globalRatingData);
            setComments(commentsData);
            setIsFavourite(isFav);
        } catch (error) {
            console.error('Error loading track data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleRatingClick = async (newRating: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to rate');
                return;
            }

            if (userRating === newRating) {
                // Toggle off (delete rating)
                await deleteItemRating(track.id, 'track');
                setUserRating(0); // Set to 0 to indicate no rating
                showSuccess('Rating removed');
            } else {
                setUserRating(newRating);
                await submitPersonalRating(user.id, track.id, 'track', newRating);
                showSuccess(`Rated ${newRating}/5`);
            }

            // Refresh global rating
            const updatedRatingData = await getTrackRating(track.id);
            setRatingData(updatedRatingData);
        } catch (error) {
            console.error('Error updating rating:', error);
            showError('Failed to update rating. Please try again.');
        }
    };

    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to add tags');
                return;
            }

            const tagToAdd = newTag.trim();
            if (tags.includes(tagToAdd)) {
                showError('Tag already exists');
                setNewTag('');
                return;
            }

            try {
                // Import and use addItemTag which creates custom tag if needed and links it
                const { addItemTag } = await import('../../../services/item_services');
                await addItemTag(track.id, 'track', tagToAdd);
                setTags([...tags, tagToAdd]);
                setNewTag('');
                showSuccess(`Tag #${tagToAdd} added`);
            } catch (error) {
                console.error('Error adding tag:', error);
                showError('Failed to add tag');
            }
        }
    };

    const removeTag = async (tagToRemove: string) => {
        const prevTags = [...tags];
        setTags(tags.filter(tag => tag !== tagToRemove));

        try {
            const { removeItemTag } = await import('../../../services/item_services');
            await removeItemTag(track.id, 'track', tagToRemove);
            showSuccess(`Tag #${tagToRemove} removed`);
        } catch (error) {
            console.error('Error removing tag:', error);
            setTags(prevTags); // Revert on error
            showError('Failed to remove tag');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            await createComment(track.id, 'track', newComment);
            setNewComment('');

            // Refresh comments
            const updatedComments = await getItemComments(track.id, 'track');
            setComments(updatedComments);
        } catch (error: any) {
            console.error('Error adding comment:', error);
            // Show user-friendly message for auth/permission errors
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
                    // Optional: Close modal if removed from a context where it disappears? 
                    // User might want to keep it open to undo. 
                    // But existing behavior was onClose(). Let's keep it if onRemove is present.
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite); // Revert
            showError('Failed to update favourite status');
        }
    };

    const handleOpenPlaylistModal = () => {
        setShowPlaylistModal(true); // Just show playlist modal on top
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl h-[515px] bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 border border-white/5"
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-20">
                    <ExpandButton
                        onClick={onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                    />
                </div>

                {/* Left Column - TrackHeader */}
                <TrackHeader
                    track={track}
                    imgError={imgError}
                    setImgError={setImgError}
                    userRating={userRating}
                    tags={tags}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    handleRatingClick={handleRatingClick}
                    handleAddTag={handleAddTag}
                    removeTag={removeTag}
                    userName={userName}
                    onClose={onClose}
                />

                {/* Right Column: Tabs Content */}
                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                        {(['review', 'community', 'settings'] as const).map((tab) => (
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
                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">

                        {activeTab === 'review' && (
                            <TrackReview
                                track={track}
                                userRating={userRating}
                                tags={tags}
                                newTag={newTag}
                                setNewTag={setNewTag}
                                isTagMenuOpen={isTagMenuOpen}
                                setIsTagMenuOpen={setIsTagMenuOpen}
                                handleRatingClick={handleRatingClick}
                                handleAddTag={handleAddTag}
                                removeTag={removeTag}
                                userName={userName}
                            />
                        )}

                        {activeTab === 'community' && (
                            <TrackCommunity
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
                            <TrackSettings
                                track={track}
                                handleCopyLink={handleCopyLink}
                                isFavourite={isFavourite}
                                onToggleFavourite={handleToggleFavourite}
                                onOpenPlaylistModal={handleOpenPlaylistModal}
                            />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Playlist Selection Modal - Rendered at parent level */}
            {showPlaylistModal && (
                <PlaylistSelectCard
                    trackId={track.id}
                    trackName={track.name}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </div>,
        document.body
    );
};
