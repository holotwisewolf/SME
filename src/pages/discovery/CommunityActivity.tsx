import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import ActivityCard from '../../features/discovery/components/ActivityCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ExpandedPlaylistCard } from '../../features/playlist/components/expanded_card/ExpandedPlaylistCard';

// Imports for Modals
import { TrackReviewModal } from '../../features/favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { ArtistDetailModal } from '../../features/spotify/components/ArtistDetailModal';
import { ExpandedAlbumCard } from '../../features/favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';

// Import Hook
import { useCommunityActivity, type ActivityType } from '../../features/discovery/hooks/useCommunityActivity';

const CommunityActivity: React.FC = () => {
    const {
        activities,
        loading,
        filterType, setFilterType,
        refreshing,
        selectedTrack, setSelectedTrack,
        selectedArtist,
        selectedAlbumId, setSelectedAlbumId,
        selectedPlaylist, setSelectedPlaylist,
        isLoadingDetails,
        handleRefresh,
        handleUserClick,
        handleTrackClick,
        handleArtistClick,
        handleAlbumClick,
        handlePlaylistClick,
        handleCloseArtistModal
    } = useCommunityActivity();

    const filteredActivities = filterType === 'all'
        ? activities
        : activities.filter(a => a.type === filterType);

    const activityTypes = [
        { value: 'all' as ActivityType, label: 'All Activity', count: activities.length },
        { value: 'rating' as ActivityType, label: 'Ratings', count: activities.filter(a => a.type === 'rating').length },
        { value: 'comment' as ActivityType, label: 'Comments', count: activities.filter(a => a.type === 'comment').length },
        { value: 'favorite' as ActivityType, label: 'Favorites', count: activities.filter(a => a.type === 'favorite').length },
        { value: 'tag' as ActivityType, label: 'Tags', count: activities.filter(a => a.type === 'tag').length },
    ];

    return (
        <div className="h-full flex flex-col p-8 relative">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FFD1D1]/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#FFD1D1]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">Community Activity</h1>
                            <p className="text-[#D1D1D1]/60 mt-1">Real-time feed of community interactions</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg text-[#D1D1D1] hover:border-[#FFD1D1]/30 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {activityTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setFilterType(type.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${filterType === type.value
                            ? 'bg-[#FFD1D1] text-black'
                            : 'bg-[#292929] text-[#D1D1D1]/70 hover:text-[#D1D1D1] border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30'
                            }`}
                    >
                        {type.label}
                        {type.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${filterType === type.value ? 'bg-black/20' : 'bg-[#FFD1D1]/10'
                                }`}>
                                {type.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-xl font-semibold text-[#D1D1D1] mb-2">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {filteredActivities.map((activity, index) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                index={index}
                                onTrackClick={handleTrackClick}
                                onArtistClick={handleArtistClick}
                                onAlbumClick={handleAlbumClick}
                                onPlaylistClick={handlePlaylistClick}
                                onUserClick={handleUserClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {selectedArtist && (
                <ArtistDetailModal
                    artist={selectedArtist}
                    onClose={handleCloseArtistModal}
                />
            )}

            {selectedAlbumId && (
                <ExpandedAlbumCard
                    albumId={selectedAlbumId}
                    onClose={() => setSelectedAlbumId(null)}
                />
            )}

            {selectedPlaylist && (
                <ExpandedPlaylistCard
                    playlist={selectedPlaylist}
                    onClose={() => setSelectedPlaylist(null)}
                    onTitleChange={(newTitle) => setSelectedPlaylist(prev => prev ? { ...prev, title: newTitle } : null)}
                    onColorChange={(newColor) => setSelectedPlaylist(prev => prev ? { ...prev, color: newColor } : null)}
                    onDeletePlaylist={() => {
                        setSelectedPlaylist(null);
                        handleRefresh();
                    }}
                />
            )}

            {isLoadingDetails && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default CommunityActivity;