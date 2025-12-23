import React from 'react';
import { createPortal } from 'react-dom';
import type { Tables } from '../../../../types/supabase';
import { useExpandedPlaylist } from '../../hooks/useExpandedPlaylist';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTracks } from './PlaylistTracks';
import { PlaylistCommunity } from './PlaylistCommunity';
import { PlaylistSettings } from './PlaylistSettings';
import { PlaylistReview } from './PlaylistReview';
import ExpandButton from '../../../../components/ui/ExpandButton';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { TrackReviewModal } from '../../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import SpotifyReconnectModal from '../../../../components/ui/SpotifyReconnectModal';
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
    onUpdate?: () => void;
}

export const ExpandedPlaylistCard: React.FC<ExpandedPlaylistCardProps> = (props) => {
    const {
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
        signInWithSpotify
    } = useExpandedPlaylist({ ...props, onUpdate: props.onUpdate });

    if (loading) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={props.onClose}>
                <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto" onClick={(e) => e.stopPropagation()}>
                    <LoadingSpinner className="w-12 h-12 text-[white]" />
                </div>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={props.onClose}>
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
                    <ExpandButton onClick={props.onClose} className="rotate-180 hover:bg-white/10 rounded-full p-1" strokeColor="white" title="Collapse" />
                </div>

                <PlaylistHeader
                    playlistId={props.playlist.id}
                    creatorName={creatorName}
                    playlistImgUrl={playlistImgUrl}
                    imgError={imgError}
                    setImgError={setImgError}
                    ratingData={ratingData}
                    userRating={isOwner ? userRating : creatorRating}
                    tags={creatorTags}
                    isEditingTitle={isEditingTitle}
                    setIsEditingTitle={setIsEditingTitle}
                    playlistTitle={playlistTitle}
                    setPlaylistTitle={setPlaylistTitle}
                    handleTitleUpdate={handleTitleUpdate}
                    isEditingEnabled={isEditingEnabled}
                    onRatingUpdate={handleRatingUpdate}
                    onImageUpdate={handleImageUpdate}
                    trackCount={filteredTracks.length}
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
                            <input
                                type="text"
                                placeholder="Search in playlist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#151515]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[white]/40 transition-colors"
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    )}

                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">
                        {activeTab === 'tracks' && (
                            <PlaylistTracks tracks={filteredTracks} isEditingEnabled={isEditingEnabled} onRemoveTrack={handleRemoveTrack} onReorderTracks={handleReorderTracks} onTrackClick={(track) => setSelectedTrack(track)} />
                        )}

                        {activeTab === 'review' && (
                            <PlaylistReview
                                playlist={props.playlist}
                                userRating={userRating}
                                tags={userTags}
                                setTags={setUserTags}
                                isEditingEnabled={isEditingEnabled}
                                userName={currentUserName}
                                onDescriptionChange={(isOwner && isEditingEnabled) ? (newDescription) => {
                                    props.playlist.description = newDescription;
                                    if (props.onUpdate) props.onUpdate();
                                } : undefined}
                                onTagsUpdate={handleTagsSync}
                                onRatingUpdate={handleRatingUpdate}
                            />
                        )}

                        {activeTab === 'community' && (
                            <PlaylistCommunity comments={comments} newComment={newComment} setNewComment={setNewComment} handleAddComment={handleAddComment} commentLoading={commentLoading} ratingData={ratingData} tags={communityTags} />
                        )}

                        {activeTab === 'settings' && (
                            <PlaylistSettings
                                playlistId={props.playlist.id}
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

            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack.details || selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            <SpotifyReconnectModal
                isOpen={showSpotifyReconnect}
                onClose={() => setShowSpotifyReconnect(false)}
                onReconnect={handleSpotifyReconnect}
                onFullLogin={signInWithSpotify}
            />

        </div>,
        document.body
    );
};