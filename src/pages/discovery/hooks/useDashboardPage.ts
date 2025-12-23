import { useState, useCallback, useEffect } from 'react';
import { useDiscoveryData } from '../../../features/discovery/hooks/useDiscoveryData';
import { useItemSelection } from '../../../features/discovery/hooks/useItemSelection';
import { useSuccess } from '../../../context/SuccessContext';
import type { DiscoveryFilters } from '../../../features/discovery/types/discovery';
import {
    getFavouriteTracks as getAllFavouriteTracks,
    getFavouritePlaylists as getAllFavouritePlaylists,
    getFavouriteAlbums as getAllFavouriteAlbums,
    addToFavourites,
    removeFromFavourites
} from '../../../features/favourites/services/favourites_services';

type TabType = 'tracks' | 'albums' | 'playlists';
const DASHBOARD_TAB_KEY = 'dashboard_active_tab';

export const useDashboardPage = () => {
    const { showSuccess } = useSuccess();
    // Initialize from localStorage or default to 'playlists'
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const savedTab = localStorage.getItem(DASHBOARD_TAB_KEY);
        if (savedTab === 'tracks' || savedTab === 'albums' || savedTab === 'playlists') {
            return savedTab;
        }
        return 'playlists';
    });

    const [filters, setFilters] = useState<DiscoveryFilters>({
        timeRange: 'week',
        sortBy: 'trending',
    });

    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Persist tab state to localStorage
    useEffect(() => {
        localStorage.setItem(DASHBOARD_TAB_KEY, activeTab);
    }, [activeTab]);

    // Custom hooks handle complexity
    const { items, loading, topThree, remaining } = useDiscoveryData(activeTab, filters, 20, refreshKey);
    const { selectedPlaylist, selectedTrack, selectedAlbum, handleItemClick, clearSelection, initialTab, initialIsTagMenuOpen } = useItemSelection();

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        // Reset refreshing state after a short delay
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Fetch favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const [favTracks, favPlaylists, favAlbums] = await Promise.all([
                    getAllFavouriteTracks(),
                    getAllFavouritePlaylists(),
                    getAllFavouriteAlbums()
                ]);

                const ids = new Set([
                    ...favTracks.map(t => t.item_id),
                    ...favPlaylists,
                    ...favAlbums.map(a => a.item_id)
                ]);
                setFavoriteIds(ids);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [refreshKey]); // Refresh favorites when refreshKey changes

    const handleToggleFavorite = async (item: { id: string, type: 'track' | 'album' | 'playlist' }) => {
        const isFav = favoriteIds.has(item.id);

        // Optimistic update
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (isFav) {
                next.delete(item.id);
            } else {
                next.add(item.id);
            }
            return next;
        });

        try {
            if (isFav) {
                await removeFromFavourites(item.id, item.type);
            } else {
                await addToFavourites(item.id, item.type);
                showSuccess('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setFavoriteIds(prev => {
                const next = new Set(prev);
                if (isFav) {
                    next.add(item.id);
                } else {
                    next.delete(item.id);
                }
                return next;
            });
        }
    };

    return {
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        refreshKey,
        refreshing,
        handleRefresh,
        items,
        loading,
        topThree,
        remaining,
        selectedPlaylist,
        selectedTrack,
        selectedAlbum,
        handleItemClick,
        clearSelection,
        initialTab,
        initialIsTagMenuOpen,
        favoriteIds,
        handleToggleFavorite
    };
};
