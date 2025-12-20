import { TrackPreviewAudio } from '../components/TrackPreviewAudio';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import { TrackReviewModal } from '../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { useTrackPreview } from '../hooks/useTrackPreview';
import { useSidebarBlur } from '../../../hooks/useSidebarBlur';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { AnimatedLoadingDots } from '../../../components/ui/AnimatedLoadingDots';
import FavButton from '../../../components/ui/FavButton';
import ExpandButton from '../../../components/ui/ExpandButton';
import { useTracksFullPage } from '../hooks/useTracksFullPage';

export function TracksFullPage() {
    const {
        artistName,
        search,
        tracks,
        loading,
        loadingMore,
        total,
        playlistModalTrack, setPlaylistModalTrack,
        selectedTrack, setSelectedTrack,
        favoritedTracks,
        handleLoadMore,
        handleTrackClick,
        handleToggleFavourite
    } = useTracksFullPage();

    const { playPreview, stopPreview } = useTrackPreview();

    useSidebarBlur(!!selectedTrack || !!playlistModalTrack);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#696969]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#696969] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {tracks.length} Tracks for '{artistName || search || 'All Tracks'}'
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tracks.map((track) => (
                        <TrackPreviewAudio
                            key={`${track.id}-${tracks.indexOf(track)}`} // Ensure unique key if duplicates exist
                            trackId={track.id}
                            previewUrl={track.preview_url ?? undefined}
                            onPlayPreview={playPreview}
                            onStopPreview={stopPreview}
                        >
                            <div
                                onClick={() => handleTrackClick(track)}
                                className="bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#282828] transition-colors relative group cursor-pointer"
                            >
                                <img
                                    src={track.album.images[0]?.url}
                                    alt={track.name}
                                    className="w-full aspect-square object-cover rounded-md mb-3"
                                />
                                <h3 className="text-white font-semibold truncate">{track.name}</h3>
                                <p className="text-gray-400 text-sm truncate">
                                    {track.artists.map(a => a.name).join(', ')}
                                </p>
                                <p className="text-gray-500 text-xs truncate">{track.album.name}</p>

                                {/* Favorite and Expand Buttons Overlay - Top Right Corner */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center h-8 px-2 gap-1 bg-black/20 backdrop-blur-md rounded-xl hover:bg-black transition-colors duration-300">
                                        <div className="scale-80 flex items-center">
                                            <FavButton
                                                isFavourite={favoritedTracks.has(track.id)}
                                                onClick={(e) => handleToggleFavourite(e, track.id)}
                                            />
                                        </div>
                                        <div className="scale-80 flex items-center">
                                            <ExpandButton onClick={(e) => {
                                                e.stopPropagation();
                                                handleTrackClick(track);
                                            }} strokeColor="white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TrackPreviewAudio>
                    ))}
                </div>

                {tracks.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No tracks found
                    </div>
                )}

                {/* Load More Button */}
                {tracks.length < total && tracks.length > 0 && (
                    <div className="flex justify-center mt-12 mb-8">
                        {loadingMore ? (
                            <div className="flex flex-col items-center gap-2">
                                <AnimatedLoadingDots color="#ffffff" size={40} />
                            </div>
                        ) : (
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-sm"
                            >
                                Load More
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackId={playlistModalTrack.id}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}
        </div>
    );
}
