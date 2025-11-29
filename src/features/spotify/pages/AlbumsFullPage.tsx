import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAlbums, getAlbumDetails } from '../services/spotify_services';
import { addToFavourites } from '../services/playlist_services';
import { TrackDetailModal } from '../components/TrackDetailModal';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import type { SpotifyAlbum, SpotifyTrack } from '../type/spotify_types';
// new import
import { AlbumDetailModal } from '../components/AlbumDetailModal'; 

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
    const albumId = searchParams.get('albumId');
    const search = searchParams.get('search');
    const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
    const [albumsWithTracks, setAlbumsWithTracks] = useState<Map<string, AlbumWithTracks>>(new Map());
    const [loading, setLoading] = useState(true);

    // Modal states
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id: string; name: string } | null>(null);

    // control Album Modal status
    const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);

    useEffect(() => {
        loadAlbums();
    }, [artistId, albumId, search]);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            let results: SpotifyAlbum[] = [];

            if (albumId) {
                // Fetch specific album
                const album = await getAlbumDetails(albumId);
                results = [album];
            } else if (artistId) {
                // Fetch artist albums
                const query = `artist:${artistId}`;
                results = await searchAlbums(query, 50);
            } else if (search) {
                // Fetch search results
                results = await searchAlbums(search, 50);
            } else {
                // Fetch top albums
                results = await searchAlbums('top albums', 50);
            }

            setAlbums(results);

            // Load tracks for all albums
            const tracksMap = new Map<string, AlbumWithTracks>();
            for (const album of results.slice(0, 20)) { // Limit to first 20 to avoid too many requests
                try {
                    // If we already fetched details (case: albumId), we might already have tracks?
                    // getAlbumDetails returns tracks too.
                    // But searchAlbums results don't have tracks.

                    let albumData;
                    if (albumId && album.id === albumId) {
                        // We already have the full album data from getAlbumDetails
                        albumData = album;
                    } else {
                        albumData = await getAlbumDetails(album.id);
                    }

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
                            trackNumber: track.track_number || index + 1,
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

    const handleTrackClick = (track: AlbumTrack, album: SpotifyAlbum) => {
        // Construct a full SpotifyTrack object from the partial data
        const fullTrack: SpotifyTrack = {
            id: track.id,
            name: track.name,
            artists: album.artists, // Use album artists as fallback since track artists aren't in AlbumTrack
            album: {
                id: album.id,
                name: album.name,
                images: album.images
            },
            duration_ms: track.duration,
            preview_url: track.previewUrl || null,
            external_urls: { spotify: `https://open.spotify.com/track/${track.id}` },
            uri: `spotify:track:${track.id}`
        };
        setSelectedTrack(fullTrack);
    };

    // handle album click
    const handleAlbumClick = (album: SpotifyAlbum) => {
        setSelectedAlbum(album);
    };

    const handleAddToFavourites = async (trackId: string) => {
        try {
            await addToFavourites(trackId);
            // Optional: Show success toast
        } catch (error) {
            console.error('Error adding to favourites:', error);
        }
    };

    const handleAddToPlaylist = (trackId: string) => {
        if (selectedTrack) {
            setPlaylistModalTrack({ id: trackId, name: selectedTrack.name });
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
                    {albumId ? 'Album Details' : (artistId ? 'Artist Albums' : (search ? `Results for "${search}"` : 'All Albums'))}
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

                                        {/* added onclick on the album img */}
                                        <div
                                            onClick={() => handleAlbumClick(album)}
                                            className="cursor-pointer group relative"
                                        >
                                            <img
                                                src={album.images[0]?.url}
                                                alt={album.name}
                                                className="w-full aspect-square object-cover rounded-md mb-3"
                                            />
                                            {/*notion logo YJ can modified*/} 
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-black/60 rounded-full p-2">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 5 8.268 7.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

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
                                                            onClick={() => handleTrackClick(track, album)}
                                                            className="flex justify-between items-center px-3 py-2 hover:bg-[#383838] rounded transition-colors group cursor-pointer"
                                                        >
                                                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                                                <span className="text-gray-500 text-sm w-6 text-right flex-shrink-0 group-hover:text-white transition-colors">
                                                                    {track.trackNumber}
                                                                </span>
                                                                <span className="text-white text-sm truncate font-medium">
                                                                    {track.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-500 text-xs flex-shrink-0 ml-4 group-hover:text-gray-300 transition-colors">
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

            {/* Track Detail Modal */}
            {selectedTrack && (
                <TrackDetailModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                    onAddToFavourites={handleAddToFavourites}
                    onAddToPlaylist={handleAddToPlaylist}
                />
            )}

            {/* Album Detail Modal */}
            {selectedAlbum && (
                <AlbumDetailModal 
                    album={selectedAlbum}
                    onClose={() => setSelectedAlbum(null)}
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
