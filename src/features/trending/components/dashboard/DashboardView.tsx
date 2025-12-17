// DashboardView - Main dashboard view with filters, tabs, and trending content

import React, { useRef } from 'react';
import TrendingFilters from '../TrendingFilters';
import DiscoverySidebar from '../DiscoverySidebar';
import TabNavigation from './TabNavigation';
import SortDropdown from './SortDropdown';
import TrendingContent from './TrendingContent';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import { useScrollIndicator } from '../../hooks/useScrollIndicator';
import type { TrendingItem, TrendingFilters as TrendingFiltersType } from '../../types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

interface DashboardViewProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
    items: TrendingItem[];
    loading: boolean;
    topThree: TrendingItem[];
    remaining: TrendingItem[];
    onItemClick: (item: TrendingItem) => void;
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
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const allTrendingRef = useRef<HTMLHeadingElement>(null);

    const {
        showIndicator,
        isHovering,
        setIsHovering,
        handleScroll,
        scrollToRankings,
    } = useScrollIndicator(scrollContainerRef, allTrendingRef, remaining.length > 0);

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
            <TrendingFilters filters={filters} onFiltersChange={onFiltersChange} />

            {/* Center Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl overflow-hidden">
                {/* Tab Navigation - Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
                    <TabNavigation activeTab={activeTab} onTabChange={onTabChange} variant="dashboard" />
                    <SortDropdown sortBy={filters.sortBy} onSortChange={(sortBy) => onFiltersChange({ ...filters, sortBy })} />
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
                        <TrendingContent
                            activeTab={activeTab}
                            topThree={topThree}
                            remaining={remaining}
                            onItemClick={onItemClick}
                            scrollContainerRef={scrollContainerRef}
                            allTrendingRef={allTrendingRef}
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
            <DiscoverySidebar filters={filters} onFiltersChange={onFiltersChange} />
        </div>
    );
};

export default DashboardView;
