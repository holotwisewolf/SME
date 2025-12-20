import React from 'react';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import { useExpandedAlbum } from '../../hooks/useExpandedAlbum';
import { AlbumHeader } from './AlbumHeader';
import { AlbumTracks } from './AlbumTracks';
import { AlbumCommunity } from './AlbumCommunity';
import { AlbumSettings } from './AlbumSettings';
import { AlbumReview } from './AlbumReview';
import ExpandButton from '../../../../../components/ui/ExpandButton';
import { TrackReviewModal } from '../../../favourites_tracks/components/expanded_card/TrackReviewModal';
import { PlaylistSelectCard } from '../../../../spotify/components/PlaylistSelectCard';

interface ExpandedAlbumCardProps {
    albumId: string;
    onClose?: () => void;
    onRemove?: () => void;
}

export const ExpandedAlbumCard: React.FC<ExpandedAlbumCardProps> = (props) => {
    const {
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
    } = useExpandedAlbum(props);

    if (loading || !album) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={props.onClose}>
                <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto" onClick={(e) => e.stopPropagation()}>
                    <LoadingSpinner className="w-12 h-12 text-[white]" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={props.onClose}>
            <div
                className="flex flex-col md:flex-row bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl mx-auto border border-white/5 relative h-[515px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <ExpandButton
                        onClick={props.onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                        title="Collapse"
                    />
                </div>

                {/* Left Column - Header */}
                <AlbumHeader
                    albumId={props.albumId}
                    album={album}
                    ratingData={ratingData}
                    userRating={userRating}
                    tags={personalTags}
                    onRatingUpdate={handleRatingUpdate}
                    userName={userName}
                    onClose={props.onClose}
                />

                {/* Right Column */}
                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    {/* Tab Navigation */}
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

                    {/* Search Bar for Tracks */}
                    {activeTab === 'tracks' && (
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search in album..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="w-full bg-[#151515]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[white]/40 transition-colors"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Content Panel */}
                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">
                        {activeTab === 'tracks' && (
                            <AlbumTracks
                                tracks={filteredTracks}
                                albumImage={album.images?.[0]?.url}
                                onTrackClick={(track) => setSelectedTrack(track)}
                            />
                        )}

                        {activeTab === 'review' && (
                            <AlbumReview
                                albumId={props.albumId}
                                album={album}
                                userRating={userRating}
                                tags={personalTags}
                                setTags={setPersonalTags}
                                onRatingUpdate={handleRatingUpdate}
                                userName={userName}
                            />
                        )}

                        {activeTab === 'community' && (
                            <AlbumCommunity
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
                            <AlbumSettings
                                albumSpotifyUrl={album.external_urls?.spotify}
                                onRemove={handleRemoveFromFavourites}
                                onImportToPlaylist={handleImportToPlaylist}
                                isFavourite={isFavourite}
                                onToggleFavourite={handleToggleFavourite}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={{
                        ...selectedTrack,
                        album: selectedTrack.album || album
                    }}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackIds={playlistModalTrack.trackIds}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}
        </div>
    );
};
