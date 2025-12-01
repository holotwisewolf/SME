import React, { useState, useEffect } from 'react';
import { getFavouriteTracks } from '../services/favourites_services';
import { getMultipleTracks } from '../../spotify/services/spotify_services';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import { TrackDetailModal } from '../../spotify/components/TrackDetailModal';
import { PlaylistSelectCard } from '../../spotify/components/PlaylistSelectCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

import { useLogin } from '../../auth/components/LoginProvider';

const FavouritesTracks: React.FC = () => {
    const { isLoading: isAuthLoading } = useLogin();
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [showPlaylistSelect, setShowPlaylistSelect] = useState(false);

    useEffect(() => {
        if (!isAuthLoading) {
            loadFavourites();
        }
    }, [isAuthLoading]);

    const loadFavourites = async () => {
        setLoading(true);
        try {
            const trackIds = await getFavouriteTracks();
            if (trackIds.length > 0) {
                // Spotify allows max 50 tracks per request
                // For now, we'll just take the first 50. Pagination can be added later.
                const batch = trackIds.slice(0, 50);
                const data = await getMultipleTracks(batch);
                setTracks(data.tracks);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error('Error loading favourites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackClick = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    const handleAddToPlaylist = () => {
        setShowPlaylistSelect(true);
        // Keep the modal open or handle z-index accordingly
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Liked Songs</h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {tracks.length === 0 ? (
                        <div className="text-gray-500">No liked songs yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    onClick={() => handleTrackClick(track)}
                                    className="flex items-center p-3 rounded-md hover:bg-[#2a2a2a] cursor-pointer group transition-colors"
                                >
                                    <div className="w-8 text-gray-400 text-right mr-4">{index + 1}</div>
                                    <div className="w-12 h-12 mr-4 flex-shrink-0">
                                        {track.album.images[0] && (
                                            <img
                                                src={track.album.images[0].url}
                                                alt={track.album.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{track.name}</div>
                                        <div className="text-sm text-gray-400 truncate">
                                            {track.artists.map(a => a.name).join(', ')}
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-sm text-gray-400 w-1/3 truncate px-4">
                                        {track.album.name}
                                    </div>
                                    <div className="text-sm text-gray-400 w-16 text-right">
                                        {Math.floor(track.duration_ms / 60000)}:
                                        {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {selectedTrack && (
                <TrackDetailModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                    onAddToFavourites={() => { }} // Already in favourites
                    onAddToPlaylist={handleAddToPlaylist}
                />
            )}

            {showPlaylistSelect && selectedTrack && (
                <PlaylistSelectCard
                    trackId={selectedTrack.id}
                    trackName={selectedTrack.name}
                    onClose={() => setShowPlaylistSelect(false)}
                />
            )}
        </div>
    );
};

export default FavouritesTracks;
