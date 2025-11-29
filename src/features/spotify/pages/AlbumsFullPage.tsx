import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAlbums, getAlbumDetails } from '../services/spotify_services';
import { addToFavourites } from '../services/playlist_services';
import { TrackDetailModal } from '../components/TrackDetailModal';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import type { SpotifyAlbum, SpotifyTrack } from '../type/spotify_types';
import { AlbumDetailModal } from '../components/AlbumDetailModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ViewIcon from '../../../components/ui/ViewIcon';
import { AnimatedLoadingDots } from '../../../components/ui/AnimatedLoadingDots';
import { ResultMenuDropdown } from '../components/ResultMenuDropdown';

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
    const artistName = searchParams.get('artistName');
    const albumId = searchParams.get('albumId');
    const search = searchParams.get('search');

    const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
    const [albumsWithTracks, setAlbumsWithTracks] = useState<Map<string, AlbumWithTracks>>(new Map());
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Modal states
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id?: string; name: string; trackIds?: string[] } | null>(null);

    // control Album Modal status
    const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);

    useEffect(() => {
        loadAlbums(true);
    }, [artistId, artistName, albumId, search]);

    const loadAlbums = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setAlbums([]);
        } else {
            setLoadingMore(true);
        }

        try {
            let results: SpotifyAlbum[] = [];
            let totalCount = 0;
            const offset = reset ? 0 : albums.length;

            if (albumId) {
                // Fetch specific album
                const album = await getAlbumDetails(albumId);
                results = [album];
                totalCount = 1;
            } else {
                let query = 'top albums';
                if (artistName) {
                    query = `artist:"${artistName}"`;
                } else if (artistId) {
                    query = `artist:${artistId}`;
                } else if (search) {
                    query = search;
                }

                const data = await searchAlbums(query, 10, offset);
                results = data.items;
                totalCount = data.total;
            }

            if (reset) {
                setAlbums(results);
            } else {
                setAlbums(prev => [...prev, ...results]);
            }
            setTotal(totalCount);

            // Load tracks for all albums
            // Only load tracks for NEW albums to save requests
            const tracksMap = new Map<string, AlbumWithTracks>(reset ? [] : albumsWithTracks);

            for (const album of results.slice(0, 20)) { // Limit to first 20 of the batch
                try {
                    if (tracksMap.has(album.id)) continue;

                    let albumData;
                    if (albumId && album.id === albumId) {
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
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadAlbums(false);
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

    const handleAddToFavourites = async (id: string, type: 'track' | 'album' = 'track') => {
        try {
            await addToFavourites(id, type);
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

    const handleImportAlbumToPlaylist = (album: SpotifyAlbum) => {
        const albumData = albumsWithTracks.get(album.id);
        if (albumData && albumData.tracks.length > 0) {
            const trackIds = albumData.tracks.map(t => t.id);
            setPlaylistModalTrack({
                name: album.name,
                trackIds: trackIds
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {albums.length} Albums for '{artistName || (albumId ? 'Album Details' : (search || 'All Albums'))}'
                </h1>

                <div className="space-y-4">
                    {albums.map((album) => {
                        const albumWithTracks = albumsWithTracks.get(album.id);

                        return (
                            <div
                                key={`${album.id}-${albums.indexOf(album)}`}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:bg-[#282828] transition-colors"
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Left Side - Album Image & Details */}
                                    <div className="flex-shrink-0 w-48 flex flex-col">

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
                                            <ViewIcon />
                                        </div>

                                        {/* Album Actions - Refactored Layout */}
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-white font-semibold text-lg line-clamp-2 flex-1 mr-2">
                                                {album.name}
                                            </h3>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToFavourites(album.id, 'album');
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                                                    title="Add to Favourites"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>

                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ResultMenuDropdown
                                                        trackId={album.id}
                                                        spotifyUrl={album.external_urls.spotify}
                                                        isOpen={activeMenuId === album.id}
                                                        onToggle={(isOpen) => setActiveMenuId(isOpen ? album.id : null)}
                                                        onAddToFavourites={(id) => handleAddToFavourites(id, 'album')}
                                                        onImportToPlaylist={() => handleImportAlbumToPlaylist(album)}
                                                        type="album"
                                                        hideActions={false}
                                                        showFavourites={false}
                                                        placement="right-start"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-1">
                                            {album.artists.map(a => a.name).join(', ')}
                                        </p>
                                        <p className="text-gray-500 text-xs mb-4">
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
                                                    <LoadingSpinner className="w-6 h-6" />
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

                {/* Load More Button */}
                {albums.length < total && albums.length > 0 && !albumId && (
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
                    onAddToFavourites={(id) => handleAddToFavourites(id, 'track')}
                    onAddToPlaylist={handleAddToPlaylist}
                />
            )}

            {/* Album Detail Modal */}
            {selectedAlbum && (
                <AlbumDetailModal
                    album={selectedAlbum}
                    onClose={() => setSelectedAlbum(null)}
                    onAddToFavourites={(id) => handleAddToFavourites(id, 'album')}
                    onImportToPlaylist={handleImportAlbumToPlaylist}
                />
            )}

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackId={playlistModalTrack.id}
                    trackIds={playlistModalTrack.trackIds}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}
        </div>
    );
}
