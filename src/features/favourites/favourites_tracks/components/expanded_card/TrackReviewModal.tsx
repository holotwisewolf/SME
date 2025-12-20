import React from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';
import { useTrackReview } from '../../hooks/useTrackReview';
import ExpandButton from '../../../../../components/ui/ExpandButton';
import { TrackHeader } from './TrackHeader';
import { TrackReview } from './TrackReview';
import { TrackCommunity } from './TrackCommunity';
import { TrackSettings } from './TrackSettings';
import { PlaylistSelectCard } from '../../../../spotify/components/PlaylistSelectCard';

interface TrackReviewModalProps {
    track: SpotifyTrack;
    onClose: () => void;
    onRemove?: () => void;
}

export const TrackReviewModal: React.FC<TrackReviewModalProps> = (props) => {
    const {
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
    } = useTrackReview(props);

    if (loading) return null; // Or a loading spinner if preferred, but usually modal should just appear

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={props.onClose}
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
                        onClick={props.onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                    />
                </div>

                {/* Left Column - TrackHeader */}
                <TrackHeader
                    track={props.track}
                    imgError={imgError}
                    setImgError={setImgError}
                    userRating={userRating}
                    tags={personalTags}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    handleRatingClick={handleRatingClick}
                    handleAddTag={handleAddTag}
                    removeTag={removeTag}
                    userName={userName}
                    onClose={props.onClose}
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
                                track={props.track}
                                userRating={userRating}
                                tags={personalTags}
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
                                tags={communityTags}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <TrackSettings
                                track={props.track}
                                handleCopyLink={handleCopyLink}
                                isFavourite={isFavourite}
                                onToggleFavourite={handleToggleFavourite}
                                onOpenPlaylistModal={() => setShowPlaylistModal(true)}
                            />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Playlist Selection Modal - Rendered at parent level */}
            {showPlaylistModal && (
                <PlaylistSelectCard
                    trackId={props.track.id}
                    trackName={props.track.name}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </div>,
        document.body
    );
};
