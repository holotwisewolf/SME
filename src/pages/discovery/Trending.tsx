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
        { value: 'tracks', label: 'Tracks' },
        { value: 'albums', label: 'Albums' },
        { value: 'playlists', label: 'Playlists' },
    ];

    return (
        <div className="flex flex-col h-full px-6 pb-32">
            {/* Header */}
            <div className="pt-6 mb-8">
                <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none mb-2">
                    Trending
                </h1>
                <p className="text-gray-400 text-sm">
                    Discover what the community is loving right now
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.value
                                ? 'bg-[#FFD1D1] text-black'
                                : 'bg-[#292929] text-gray-400 hover:text-white hover:bg-[#333333]'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Filters Sidebar */}
                <div className="w-80 flex-shrink-0 overflow-y-auto">
                    <TrendingFilters filters={filters} onFiltersChange={setFilters} />
                </div>

                {/* Trending Items List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner className="w-10 h-10 text-[#FFD1D1]" />
                        </div>
                    ) : trendingItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No trending {activeTab} found
                            </h3>
                            <p className="text-gray-400 text-sm max-w-md">
                                Try adjusting your filters or check back later when the community has been more active!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
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
    );
};

export default Trending;
