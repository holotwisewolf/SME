// Dashboard Page - Main community discovery dashboard

import React from 'react';
import DashboardHeader from '../../features/trending/components/dashboard/DashboardHeader';
import DashboardView from '../../features/trending/components/dashboard/DashboardView';
import ItemModals from '../../features/trending/components/dashboard/ItemModals';
import { useDashboardPage } from './hooks/useDashboardPage';

const Dashboard: React.FC = () => {
    const {
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
    } = useDashboardPage();

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
