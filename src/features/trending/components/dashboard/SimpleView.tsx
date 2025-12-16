// SimpleView - Simple list view with filters

import React from 'react';
import TrendingFilters from '../TrendingFilters';
import TabNavigation from './TabNavigation';
import TrendingCard from '../TrendingCard';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import type { TrendingItem, TrendingFilters as TrendingFiltersType } from '../../types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

interface SimpleViewProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
    items: TrendingItem[];
    loading: boolean;
    onItemClick: (item: TrendingItem) => void;
}

const SimpleView: React.FC<SimpleViewProps> = ({
    activeTab,
    onTabChange,
    filters,
    onFiltersChange,
    items,
    loading,
    onItemClick,
}) => {
    return (
        <div className="flex gap-8 flex-1 min-h-0">
            {/* Left Sidebar - Advanced Filters */}
            <TrendingFilters filters={filters} onFiltersChange={onFiltersChange} />

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6 shadow-lg">
                {/* Tab Navigation */}
                <div className="mb-6">
                    <TabNavigation activeTab={activeTab} onTabChange={onTabChange} variant="simple" />
                </div>

                {/* Content Area with Scroll */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : items.length === 0 ? (
                        <EmptyState
                            title="No trending items found"
                            description="Try adjusting your filters or check back later"
                            icon={
                                <svg className="w-8 h-8 text-[#D1D1D1]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            }
                            variant="detailed"
                        />
                    ) : (
                        <div className="space-y-3 pb-4">
                            {items.map((item, index) => (
                                <TrendingCard
                                    key={item.id}
                                    item={item}
                                    rank={index + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #696969;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #FFD1D1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #FFD1D1;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default SimpleView;
