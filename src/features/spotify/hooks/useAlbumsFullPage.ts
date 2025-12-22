import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAlbums, getAlbumDetails } from '../services/spotify_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';
import type { SpotifyAlbum, SpotifyTrack } from '../type/spotify_types';
import { useSuccess } from '../../../context/SuccessContext';
import { useError } from '../../../context/ErrorContext';
import { useSidebarBlur } from '../../../hooks/useSidebarBlur';
import { parseSpotifyError } from '../services/spotifyConnection';

export interface AlbumTrack {
    id: string;
    name: string;
    trackNumber: number;
    duration: number;
    previewUrl?: string;
}

export interface AlbumWithTracks {
    id: string;
    name: string;
    artistName: string;
    imageUrl?: string;
    releaseDate?: string;
    totalTracks?: number;
    tracks: AlbumTrack[];
}

export const useAlbumsFullPage = () => {
    const { showSuccess } = useSuccess();
    const { showError } = useError();
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
    const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);

    // Track favorited albums
    const [favoritedAlbums, setFavoritedAlbums] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadAlbums(true);
    }, [artistId, artistName, albumId, search]);

    useSidebarBlur(!!selectedAlbum || !!selectedTrack || !!playlistModalTrack);

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

            const tracksMap = new Map<string, AlbumWithTracks>(reset ? [] : albumsWithTracks);

            for (const album of results.slice(0, 20)) {
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

            const favSet = new Set<string>();
            for (const album of results) {
                const isFav = await checkIsFavourite(album.id, 'album');
                if (isFav) favSet.add(album.id);
            }
            setFavoritedAlbums(favSet);
        } catch (error) {
            console.error('Error loading albums:', error);
            const msg = parseSpotifyError(error, 'Failed to load albums');
            showError(msg);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadAlbums(false);
    };

    const handleTrackClick = (track: AlbumTrack, album: SpotifyAlbum) => {
        const fullTrack: SpotifyTrack = {
            id: track.id,
            name: track.name,
            artists: album.artists,
            album: {
                id: album.id,
                name: album.name,
                images: album.images,
                release_date: album.release_date || ''
            },
            duration_ms: track.duration,
            preview_url: track.previewUrl || null,
            external_urls: { spotify: `https://open.spotify.com/track/${track.id}` },
            uri: `spotify:track:${track.id}`
        };
        setSelectedTrack(fullTrack);
    };

    const handleAlbumClick = (album: SpotifyAlbum) => {
        setSelectedAlbum(album);
    };

    const handleAddToFavourites = async (id: string, type: 'track' | 'album' = 'track') => {
        try {
            const isFavorited = favoritedAlbums.has(id);

            if (isFavorited) {
                await removeFromFavourites(id, type);
                setFavoritedAlbums(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                showSuccess(`${type === 'album' ? 'Album' : 'Track'} removed from favorites!`);
            } else {
                await addToFavourites(id, type);
                setFavoritedAlbums(prev => new Set(prev).add(id));
                showSuccess(`${type === 'album' ? 'Album' : 'Track'} added to favorites!`);
            }
        } catch (error) {
            console.error('Error toggling favourites:', error);
            showError(`Failed to update ${type} favorites`);
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

    return {
        artistId, artistName, albumId, search,
        albums,
        albumsWithTracks,
        loading,
        loadingMore,
        total,
        activeMenuId, setActiveMenuId,
        selectedTrack, setSelectedTrack,
        playlistModalTrack, setPlaylistModalTrack,
        selectedAlbum, setSelectedAlbum,
        favoritedAlbums,
        handleLoadMore,
        handleTrackClick,
        handleAlbumClick,
        handleAddToFavourites,
        handleImportAlbumToPlaylist
    };
};
