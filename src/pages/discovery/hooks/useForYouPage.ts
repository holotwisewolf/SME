// useForYouPage - UI state and handlers for ForYou page
// Separates UI concerns from the data-fetching useForYou hook

import { useState, useEffect, useRef, useCallback } from 'react';
import type { RecommendedItem } from '../../../features/recommendations/types/recommendation_types';
import type { SpotifyTrack } from '../../../features/spotify/type/spotify_types';
import { getTrackDetails } from '../../../features/spotify/services/spotify_services';
import { addToFavourites, removeFromFavourites } from '../../../features/favourites/services/favourites_services';
import { useSuccess } from '../../../context/SuccessContext';
import { useError } from '../../../context/ErrorContext';

interface UseForYouPageProps {
    refresh: () => Promise<void>;
    loadAlbums: () => void;
}

export const useForYouPage = ({ refresh, loadAlbums }: UseForYouPageProps) => {
    const { showSuccess } = useSuccess();
    const { showError } = useError();

    // UI State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [playlistModalItem, setPlaylistModalItem] = useState<RecommendedItem | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [contentMode, setContentMode] = useState<'tracks' | 'albums'>('tracks');
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [featuredItem, setFeaturedItem] = useState<RecommendedItem | null>(null);

    const modeDropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close mode dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
                setShowModeDropdown(false);
            }
        };
        if (showModeDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModeDropdown]);

    // Load albums when switching to albums mode
    useEffect(() => {
        if (contentMode === 'albums') {
            loadAlbums();
        }
    }, [contentMode, loadAlbums]);

    // Handlers
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    }, [refresh]);

    const handleItemClick = useCallback(async (item: RecommendedItem) => {
        setFeaturedItem(item);

        if (item.type === 'track') {
            setIsLoadingTrack(true);
            try {
                const trackData = await getTrackDetails(item.id);
                setSelectedTrack(trackData);
            } catch (err) {
                console.error('Error fetching track details:', err);
                showError('Failed to load track details');
            } finally {
                setIsLoadingTrack(false);
            }
        } else if (item.type === 'album') {
            setSelectedAlbumId(item.id);
        }
    }, [showError]);

    const handleAddToFavourites = useCallback(async (item: RecommendedItem, isFavourite: boolean) => {
        try {
            if (isFavourite) {
                await addToFavourites(item.id, item.type);
                showSuccess(`Added "${item.name}" to favorites!`);
            } else {
                await removeFromFavourites(item.id, item.type);
                showError(`Removed "${item.name}" from favorites`);
            }
        } catch (err) {
            console.error('Error updating favourites:', err);
            showError('Failed to update favorites');
        }
    }, [showSuccess, showError]);

    const handleAddToPlaylist = useCallback((item: RecommendedItem) => {
        if (item.type === 'track') {
            setPlaylistModalItem(item);
        }
    }, []);

    const closeTrackModal = useCallback(() => setSelectedTrack(null), []);
    const closeAlbumModal = useCallback(() => setSelectedAlbumId(null), []);
    const closePlaylistModal = useCallback(() => setPlaylistModalItem(null), []);

    return {
        // State
        isRefreshing,
        selectedTrack,
        playlistModalItem,
        isLoadingTrack,
        selectedAlbumId,
        contentMode,
        setContentMode,
        showModeDropdown,
        setShowModeDropdown,
        featuredItem,
        modeDropdownRef,

        // Handlers
        handleRefresh,
        handleItemClick,
        handleAddToFavourites,
        handleAddToPlaylist,
        closeTrackModal,
        closeAlbumModal,
        closePlaylistModal
    };
};
