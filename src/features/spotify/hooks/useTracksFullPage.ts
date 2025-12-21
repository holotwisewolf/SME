import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTracks } from '../services/spotify_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';
import type { SpotifyTrack } from '../type/spotify_types';
import { useSuccess } from '../../../context/SuccessContext';
import { useError } from '../../../context/ErrorContext';
import { supabase } from '../../../lib/supabaseClient';

export const useTracksFullPage = () => {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const artistName = searchParams.get('artistName');
    const search = searchParams.get('search');

    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id: string; name: string } | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [favoritedTracks, setFavoritedTracks] = useState<Set<string>>(new Set());

    const { showSuccess } = useSuccess();
    const { showError } = useError();

    useEffect(() => {
        loadTracks(true);
    }, [artistId, artistName, search]);

    // Load favorited status for all tracks
    useEffect(() => {
        const loadFavorites = async () => {
            if (tracks.length === 0) return;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Check favorite status for all tracks
                const favoriteChecks = await Promise.all(
                    tracks.map(track => checkIsFavourite(track.id, 'track'))
                );

                const newFavoritedSet = new Set<string>();
                tracks.forEach((track, index) => {
                    if (favoriteChecks[index]) {
                        newFavoritedSet.add(track.id);
                    }
                });

                setFavoritedTracks(newFavoritedSet);
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };

        loadFavorites();
    }, [tracks.length]); // Only re-run when tracks array length changes


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

    const handleTrackClick = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    const handleToggleFavourite = async (e: React.MouseEvent, trackId: string) => {
        e.stopPropagation();
        const isFavorited = favoritedTracks.has(trackId);

        // Optimistic update
        setFavoritedTracks(prev => {
            const newSet = new Set(prev);
            if (isFavorited) newSet.delete(trackId);
            else newSet.add(trackId);
            return newSet;
        });

        try {
            if (isFavorited) {
                await removeFromFavourites(trackId, 'track');
                showSuccess('Removed from favorites');
            } else {
                await addToFavourites(trackId, 'track');
                showSuccess('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            showError('Failed to update favorites');
            // Revert on error
            setFavoritedTracks(prev => {
                const newSet = new Set(prev);
                if (isFavorited) newSet.add(trackId);
                else newSet.delete(trackId);
                return newSet;
            });
        }
    };

    const handleFavoriteChange = (trackId: string, isFavorite: boolean) => {
        setFavoritedTracks(prev => {
            const newSet = new Set(prev);
            if (isFavorite) {
                newSet.add(trackId);
            } else {
                newSet.delete(trackId);
            }
            return newSet;
        });
    };

    return {
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
        handleToggleFavourite,
        handleFavoriteChange
    };
};
