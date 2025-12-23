import { useState, useCallback, useEffect } from 'react';
import { useDiscoveryData } from '../../../features/discovery/hooks/useDiscoveryData';
import { useItemSelection } from '../../../features/discovery/hooks/useItemSelection';
import type { DiscoveryFilters } from '../../../features/discovery/types/discovery';

type TabType = 'tracks' | 'albums' | 'playlists';
const DASHBOARD_TAB_KEY = 'dashboard_active_tab';

export const useDashboardPage = () => {
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
    const { selectedPlaylist, selectedTrack, selectedAlbum, handleItemClick, clearSelection } = useItemSelection();

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        // Reset refreshing state after a short delay
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

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
        clearSelection
    };
};
