import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTracks } from '../services/spotify_services';
import { TrackPreviewAudio } from '../components/TrackPreviewAudio';
import { ResultMenuDropdown } from '../components/ResultMenuDropdown';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import { useTrackPreview } from '../hooks/useTrackPreview';
import { addToFavourites } from '../services/playlist_services';
import type { SpotifyTrack } from '../type/spotify_types';

export function TracksFullPage() {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const { playPreview, stopPreview } = useTrackPreview();
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        loadTracks();
    }, [artistId]);

    const loadTracks = async () => {
        setLoading(true);
        try {
            // If artistId is provided, filter by artist
            const query = artistId ? `artist:${artistId}` : 'top tracks';
            const results = await searchTracks(query, 50);
            setTracks(results);
        } catch (error) {
            console.error('Error loading tracks:', error);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <div className="text-white text-xl">Loading tracks...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {artistId ? 'Artist Tracks' : 'All Tracks'}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tracks.map((track) => (
                        <TrackPreviewAudio
                            key={track.id}
                            trackId={track.id}
                            previewUrl={track.preview_url ?? undefined}
                            onPlayPreview={playPreview}
                            onStopPreview={stopPreview}
                        >
                            <div className="bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#282828] transition-colors relative group">
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

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ResultMenuDropdown
                                        trackId={track.id}
                                        trackName={track.name}
                                        onAddToFavourites={handleAddToFavourites}
                                        onAddToPlaylist={(trackId) => handleAddToPlaylist(trackId, track.name)}
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
            </div>

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
