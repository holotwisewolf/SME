import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAlbums, getAlbumDetails } from '../services/spotify_services';
import type { SpotifyAlbum } from '../type/spotify_types';

interface AlbumTrack {
    id: string;
    name: string;
    trackNumber: number;
    duration: number;
    previewUrl?: string;
}

interface AlbumWithTracks {
    id: string;
    name: string;
    artistName: string;
    imageUrl?: string;
    releaseDate?: string;
    totalTracks?: number;
    tracks: AlbumTrack[];
}

export function AlbumsFullPage() {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
    const [albumsWithTracks, setAlbumsWithTracks] = useState<Map<string, AlbumWithTracks>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlbums();
    }, [artistId]);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const query = artistId ? `artist:${artistId}` : 'top albums';
            const results = await searchAlbums(query, 50);
            setAlbums(results);

            // Load tracks for all albums
            const tracksMap = new Map<string, AlbumWithTracks>();
            for (const album of results.slice(0, 20)) { // Limit to first 20 to avoid too many requests
                try {
                    const albumData = await getAlbumDetails(album.id);
                    tracksMap.set(album.id, {
                        id: albumData.id,
                        name: albumData.name,
                        artistName: albumData.artists[0]?.name || 'Unknown',
                        imageUrl: albumData.images[0]?.url,
                        releaseDate: albumData.release_date,
                        totalTracks: albumData.total_tracks,
                        tracks: albumData.tracks.items.map((track: any, index: number) => ({
                            id: track.id,
                            name: track.name,
                            trackNumber: index + 1,
                            duration: track.duration_ms,
                            previewUrl: track.preview_url
                        }))
                    });
                } catch (error) {
                    console.error(`Error loading album ${album.id}:`, error);
                }
            }
            setAlbumsWithTracks(tracksMap);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <div className="text-white text-xl">Loading albums...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {artistId ? 'Artist Albums' : 'All Albums'}
                </h1>

                <div className="space-y-4">
                    {albums.map((album) => {
                        const albumWithTracks = albumsWithTracks.get(album.id);

                        return (
                            <div
                                key={album.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:bg-[#282828] transition-colors"
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Left Side - Album Image & Details */}
                                    <div className="flex-shrink-0 w-48">
                                        <img
                                            src={album.images[0]?.url}
                                            alt={album.name}
                                            className="w-full aspect-square object-cover rounded-md mb-3"
                                        />
                                        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                                            {album.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-1">
                                            {album.artists.map(a => a.name).join(', ')}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
                                        </p>
                                    </div>

                                    {/* Right Side - Scrollable Track List */}
                                    <div className="flex-1 min-w-0">
                                        <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                            {albumWithTracks ? (
                                                <div className="space-y-1">
                                                    {albumWithTracks.tracks.map((track) => (
                                                        <div
                                                            key={track.id}
                                                            className="flex justify-between items-center px-3 py-2 hover:bg-[#282828] rounded transition-colors group"
                                                        >
                                                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                                                <span className="text-gray-500 text-sm w-6 text-right flex-shrink-0">
                                                                    {track.trackNumber}
                                                                </span>
                                                                <span className="text-white text-sm truncate">
                                                                    {track.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-500 text-xs flex-shrink-0 ml-4">
                                                                {Math.floor(track.duration / 60000)}:
                                                                {String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                                    Loading tracks...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {albums.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No albums found
                    </div>
                )}
            </div>
        </div>
    );
}
