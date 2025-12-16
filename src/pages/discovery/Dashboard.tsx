// Dashboard Page - Main community discovery dashboard (REFACTORED)

import React, { useState } from 'react';
import DashboardHeader from '../../features/trending/components/dashboard/DashboardHeader';
import DashboardView from '../../features/trending/components/dashboard/DashboardView';
import SimpleView from '../../features/trending/components/dashboard/SimpleView';
import ItemModals from '../../features/trending/components/dashboard/ItemModals';
import { useTrendingData } from '../../features/trending/hooks/useTrendingData';
import { useItemSelection } from '../../features/trending/hooks/useItemSelection';
import type { TrendingFilters } from '../../features/trending/types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tracks');
    const [viewMode, setViewMode] = useState<'simple' | 'dashboard'>('dashboard');
    const [filters, setFilters] = useState<TrendingFilters>({
        timeRange: 'week',
        sortBy: 'top-rated',
    });

    // Custom hooks handle complexity
    const { items, loading, topThree, remaining } = useTrendingData(activeTab, filters, 20);
    const { selectedPlaylist, selectedTrack, selectedAlbum, handleItemClick, clearSelection } = useItemSelection();

    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Header */}
            <DashboardHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Main Content */}
            {viewMode === 'dashboard' ? (
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
                />
            ) : (
                <SimpleView
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    filters={filters}
                    onFiltersChange={setFilters}
                    items={items}
                    loading={loading}
                    onItemClick={handleItemClick}
                />
            )}

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
