import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTracks } from '../services/spotify_services';
import { TrackPreviewAudio } from '../components/TrackPreviewAudio';
import { ResultMenuDropdown } from '../components/ResultMenuDropdown';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import { TrackDetailModal } from '../components/TrackDetailModal';
import { useTrackPreview } from '../hooks/useTrackPreview';
import { addToFavourites } from '../services/playlist_services';
import type { SpotifyTrack } from '../type/spotify_types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { AnimatedLoadingDots } from '../../../components/ui/AnimatedLoadingDots';

export function TracksFullPage() {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const artistName = searchParams.get('artistName');
    const search = searchParams.get('search');

    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    const { playPreview, stopPreview } = useTrackPreview();
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id: string; name: string } | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadTracks(true);
    }, [artistId, artistName, search]);

    const loadTracks = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setTracks([]);
        } else {
            setLoadingMore(true);
        }

        try {
            let query = 'top tracks';
            if (artistName) {
                query = `artist:"${artistName}"`;
            } else if (search) {
                query = search;
            }

            const limit = 50;
            const offset = reset ? 0 : tracks.length;

            const results = await searchTracks(query, limit, offset);

            if (reset) {
                setTracks(results.items);
            } else {
                setTracks(prev => [...prev, ...results.items]);
            }
            setTotal(results.total);
        } catch (error) {
            console.error('Error loading tracks:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadTracks(false);
    };

    const handleAddToFavourites = async (trackId: string) => {
        try {
            await addToFavourites(trackId);
        } catch (error) {
            console.error('Error adding to favourites:', error);
        }
    };

    const handleAddToPlaylist = (trackId: string, trackName: string) => {
        setPlaylistModalTrack({ id: trackId, name: trackName });
    };

    const handleTrackClick = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] p-8">
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

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <ResultMenuDropdown
                                        trackId={track.id}
                                        trackName={track.name}
                                        spotifyUrl={track.external_urls.spotify}
                                        isOpen={activeMenuId === track.id}
                                        onToggle={(isOpen) => setActiveMenuId(isOpen ? track.id : null)}
                                        onAddToFavourites={handleAddToFavourites}
                                        onAddToPlaylist={(trackId) => handleAddToPlaylist(trackId, track.name)}
                                        orientation="horizontal"
                                    />
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

            {/* Track Detail Modal */}
            {selectedTrack && (
                <TrackDetailModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                    onAddToFavourites={handleAddToFavourites}
                    onAddToPlaylist={(trackId) => handleAddToPlaylist(trackId, selectedTrack.name)}
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
