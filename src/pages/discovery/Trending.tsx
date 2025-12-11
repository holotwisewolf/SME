// Trending Page - Main trending content discovery page

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrendingCard from '../../features/trending/components/TrendingCard';
import TrendingFilters from '../../features/trending/components/TrendingFilters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getTrendingTracks, getTrendingAlbums, getTrendingPlaylists } from '../../features/trending/services/trending_services';
import type { TrendingItem, TrendingFilters as TrendingFiltersType } from '../../features/trending/types/trending';
import type { ItemType } from '../../types/global';

type TabType = 'tracks' | 'albums' | 'playlists';

const Trending: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tracks');
    const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<TrendingFiltersType>({
        timeRange: 'week',
        sortBy: 'top-rated',
    });

    // Fetch trending items when tab or filters change
    useEffect(() => {
        fetchTrendingItems();
    }, [activeTab, filters]);

    const fetchTrendingItems = async () => {
        setLoading(true);
        try {
            let items: TrendingItem[] = [];

            switch (activeTab) {
                case 'tracks':
                    items = await getTrendingTracks(filters);
                    break;
                case 'albums':
                    items = await getTrendingAlbums(filters);
                    break;
                case 'playlists':
                    items = await getTrendingPlaylists(filters);
                    break;
            }

            setTrendingItems(items);
        } catch (error) {
            console.error('Error fetching trending items:', error);
            setTrendingItems([]);
        } finally {
            setLoading(false);
        }
    };

    const tabs: { value: TabType; label: string }[] = [
        { value: 'playlists', label: 'Playlists' },
        { value: 'tracks', label: 'Tracks' },
        { value: 'albums', label: 'Albums' },
    ];

    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">Trending</h1>
                <p className="text-[#D1D1D1]/60 mt-2">Discover what's popular in the community</p>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-8 flex-1 min-h-0">
                {/* Left Sidebar - Advanced Filters */}
                <TrendingFilters filters={filters} onFiltersChange={setFilters} />

                {/* Right Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6 shadow-lg">
                    {/* Tab Navigation */}
                    <div className="flex gap-3 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab.value
                                        ? 'bg-[#FFD1D1] text-black shadow-lg shadow-[#FFD1D1]/20'
                                        : 'bg-[#696969]/50 text-[#D1D1D1]/70 hover:bg-[#696969] hover:text-[#D1D1D1] border border-[#D1D1D1]/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area with Scroll */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : trendingItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#FFD1D1]/20 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-[#D1D1D1]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <p className="text-xl font-semibold text-[#D1D1D1] mb-2">No trending items found</p>
                                <p className="text-sm text-[#D1D1D1]/50">Try adjusting your filters or check back later</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-4">
                                {trendingItems.map((item, index) => (
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

export default Trending;
