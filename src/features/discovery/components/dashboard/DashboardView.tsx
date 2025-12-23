// DashboardView - Main dashboard view with filters, tabs, and trending content

import React, { useRef } from 'react';
import DiscoveryFilters from './DiscoveryFilters';
import DiscoverySidebar from './DiscoverySidebar';
import TabNavigation from './TabNavigation';
import SortDropdown from './SortDropdown';
import DiscoveryContent from './DiscoveryContent';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import { useScrollIndicator } from '../../hooks/useScrollIndicator';
import type { DiscoveryItem, DiscoveryFilters as DiscoveryFiltersType } from '../../types/discovery';

type TabType = 'tracks' | 'albums' | 'playlists';

interface DashboardViewProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    filters: DiscoveryFiltersType;
    onFiltersChange: (filters: DiscoveryFiltersType) => void;
    items: DiscoveryItem[];
    loading: boolean;
    topThree: DiscoveryItem[];
    remaining: DiscoveryItem[];
    onItemClick: (item: DiscoveryItem) => void;
    refreshKey?: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    activeTab,
    onTabChange,
    filters,
    onFiltersChange,
    items,
    loading,
    topThree,
    remaining,
    onItemClick,
    refreshKey = 0,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const allDiscoveryRef = useRef<HTMLHeadingElement>(null);

    const {
        showIndicator,
        isHovering,
        setIsHovering,
        handleScroll,
        scrollToRankings,
    } = useScrollIndicator(scrollContainerRef, allDiscoveryRef, remaining.length > 0);

    const emptyStateActions = [
        {
            label: 'Reset Filters',
            onClick: () => onFiltersChange({ timeRange: 'week', sortBy: 'top-rated' }),
        },
        {
            label: 'Remove Rating Filter',
            onClick: () => onFiltersChange({ ...filters, minRating: undefined }),
        },
        {
            label: `Switch to ${activeTab === 'tracks' ? 'Playlists' : 'Tracks'}`,
            onClick: () => onTabChange(activeTab === 'tracks' ? 'playlists' : 'tracks'),
        },
    ];

    return (
        <div className="flex gap-6 flex-1 min-h-0">
            {/* Left Sidebar - Filters */}
            <DiscoveryFilters filters={filters} onFiltersChange={onFiltersChange} />

            {/* Center Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl overflow-hidden">
                {/* Tab Navigation - Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
                    <TabNavigation activeTab={activeTab} onTabChange={onTabChange} variant="dashboard" />
                    <SortDropdown sortBy={filters.sortBy} onSortChange={(sortBy) => onFiltersChange({ ...filters, sortBy })} activeTab={activeTab} />
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            title="No items found"
                            description="Try adjusting your filters"
                            actions={emptyStateActions}
                            variant="simple"
                        />
                    ) : (
                        <DiscoveryContent
                            activeTab={activeTab}
                            topThree={topThree}
                            remaining={remaining}
                            onItemClick={onItemClick}
                            scrollContainerRef={scrollContainerRef}
                            allDiscoveryRef={allDiscoveryRef}
                            onScroll={handleScroll}
                            showScrollIndicator={showIndicator}
                            isHoveringScrollIndicator={isHovering}
                            onScrollIndicatorHoverChange={setIsHovering}
                            onScrollIndicatorClick={scrollToRankings}
                        />
                    )}
                </div>
            </div>

            {/* Right Sidebar - Discovery */}
            <DiscoverySidebar filters={filters} onFiltersChange={onFiltersChange} refreshKey={refreshKey} />
        </div>
    );
};

export default DashboardView;
