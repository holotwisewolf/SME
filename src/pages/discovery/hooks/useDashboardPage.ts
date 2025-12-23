import { useState, useCallback, useEffect } from 'react';
import { useTrendingData } from '../../../features/trending/hooks/useTrendingData';
import { useItemSelection } from '../../../features/trending/hooks/useItemSelection';
import type { TrendingFilters } from '../../../features/trending/types/trending';

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

    const [filters, setFilters] = useState<TrendingFilters>({
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
    const { items, loading, topThree, remaining } = useTrendingData(activeTab, filters, 20, refreshKey);
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
