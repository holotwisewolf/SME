// Dashboard Page - Main community discovery dashboard

import React, { useState, useCallback } from 'react';
import DashboardHeader from '../../features/trending/components/dashboard/DashboardHeader';
import DashboardView from '../../features/trending/components/dashboard/DashboardView';
import ItemModals from '../../features/trending/components/dashboard/ItemModals';
import { useTrendingData } from '../../features/trending/hooks/useTrendingData';
import { useItemSelection } from '../../features/trending/hooks/useItemSelection';
import type { TrendingFilters } from '../../features/trending/types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('playlists');
    const [filters, setFilters] = useState<TrendingFilters>({
        timeRange: 'week',
        sortBy: 'top-rated',
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Custom hooks handle complexity
    const { items, loading, topThree, remaining } = useTrendingData(activeTab, filters, 20, refreshKey);
    const { selectedPlaylist, selectedTrack, selectedAlbum, handleItemClick, clearSelection } = useItemSelection();

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        // Reset refreshing state after a short delay
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Header */}
            <DashboardHeader
                onRefresh={handleRefresh}
                refreshing={refreshing || loading}
            />

            {/* Main Content - Always Dashboard View */}
            <DashboardView
                activeTab={activeTab}
                onTabChange={setActiveTab}
                filters={filters}
                onFiltersChange={setFilters}
                items={items}
                loading={loading}
                topThree={topThree}
                remaining={remaining}
                onItemClick={handleItemClick}
                refreshKey={refreshKey}
            />

            {/* Modals */}
            <ItemModals
                selectedPlaylist={selectedPlaylist}
                selectedTrack={selectedTrack}
                selectedAlbum={selectedAlbum}
                onClose={clearSelection}
            />
        </div>
    );
};

export default Dashboard;
