// Dashboard Page - Main community discovery dashboard

import React, { useState, useEffect } from 'react';
import HeroCard from '../../features/trending/components/HeroCard';
import TrendingRow from '../../features/trending/components/TrendingRow';
import TrendingCard from '../../features/trending/components/TrendingCard';
import TrendingFilters from '../../features/trending/components/TrendingFilters';
import DiscoverySidebar from '../../features/trending/components/DiscoverySidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getTrendingTracks, getTrendingAlbums, getTrendingPlaylists } from '../../features/trending/services/trending_services';
import { ExpandedPlaylistCard } from '../../features/playlist/components/expanded_card/ExpandedPlaylistCard';
import { ItemDetailModal } from '../../features/trending/components/ItemDetailModal';
import { supabase } from '../../lib/supabaseClient';
import type { TrendingItem, TrendingFilters as TrendingFiltersType } from '../../features/trending/types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('tracks');
    const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'simple' | 'dashboard'>('dashboard');
    const [filters, setFilters] = useState<TrendingFiltersType>({
        timeRange: 'week',
        sortBy: 'top-rated',
    });
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'track' | 'album' } | null>(null);

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

    // Split items into top 3 and rest
    const topThree = trendingItems.slice(0, 3);
    const remaining = trendingItems.slice(3);

    // Handle card click - playlists, tracks, and albums
    const handleCardClick = async (item: TrendingItem) => {
        if (item.type === 'playlist') {
            try {
                // Fetch full playlist data
                const { data: playlist, error } = await supabase
                    .from('playlists')
                    .select('*')
                    .eq('id', item.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching playlist:', error);
                    return;
                }

                if (playlist) {
                    setSelectedPlaylist(playlist);
                } else {
                    // Playlist was deleted - CASCADE DELETE will have cleaned up all references automatically
                    console.warn('Playlist not found in database:', item.id);
                }
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        } else if (item.type === 'track' || item.type === 'album') {
            // Show simple detail modal for tracks and albums
            setSelectedItem({ id: item.id, type: item.type as 'track' | 'album' });
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Title */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">Dashboard</h1>
                    <p className="text-[#D1D1D1]/60 mt-2">Discover what's popular in the community</p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('simple')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'simple'
                            ? 'bg-[#FFD1D1] text-black'
                            : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'
                            }`}
                    >
                        Simple
                    </button>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'dashboard'
                            ? 'bg-[#FFD1D1] text-black'
                            : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'
                            }`}
                    >
                        Dashboard
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                /* DASHBOARD VIEW */
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Left Sidebar - Filters */}
                    <TrendingFilters filters={filters} onFiltersChange={setFilters} />

                    {/* Center Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Tab Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === tab.value
                                            ? 'bg-[#FFD1D1] text-black border border-[#FFD1D1]'
                                            : 'bg-[#292929] text-[#D1D1D1]/70 hover:text-[#D1D1D1] border border-[#D1D1D1]/20 hover:border-[#FFD1D1]/30'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown - Moved from filters */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[#D1D1D1]/60">Sort by:</span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                                    className="bg-[#292929] border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer"
                                >
                                    <option value="top-rated">Top Rated</option>
                                    <option value="most-ratings">Most Ratings</option>
                                    <option value="most-commented">Most Comments</option>
                                    <option value="most-favorited">Most Favorited</option>
                                    <option value="most-activity">Recent Activity</option>
                                    <option value="newly-tagged">Newly Tagged</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : trendingItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                                <div className="w-16 h-16 rounded-full bg-[#FFD1D1]/20 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-[#D1D1D1]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <p className="text-xl font-semibold text-[#D1D1D1] mb-2">No items match your filters</p>
                                <p className="text-sm text-[#D1D1D1]/50 mb-4">Try adjusting your search criteria</p>

                                {/* Actionable Suggestions */}
                                <div className="flex flex-col gap-2 mt-4">
                                    <p className="text-xs text-[#D1D1D1]/60 mb-2">Try:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button
                                            onClick={() => setFilters({ timeRange: 'all-time', sortBy: 'top-rated' })}
                                            className="px-3 py-1.5 bg-[#292929] border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-lg hover:bg-[#FFD1D1]/10 transition-colors"
                                        >
                                            View All Time
                                        </button>
                                        <button
                                            onClick={() => setFilters({ ...filters, minRating: undefined })}
                                            className="px-3 py-1.5 bg-[#292929] border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-lg hover:bg-[#FFD1D1]/10 transition-colors"
                                        >
                                            Remove Rating Filter
                                        </button>
                                        <button
                                            onClick={() => setActiveTab(activeTab === 'tracks' ? 'playlists' : 'tracks')}
                                            className="px-3 py-1.5 bg-[#292929] border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-lg hover:bg-[#FFD1D1]/10 transition-colors"
                                        >
                                            Switch to {activeTab === 'tracks' ? 'Playlists' : 'Tracks'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Hero Cards - Top 3 */}
                                {topThree.length > 0 && (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            {topThree.map((item, index) => (
                                                <HeroCard
                                                    key={item.id}
                                                    item={item}
                                                    rank={index + 1}
                                                    onClick={() => handleCardClick(item)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Remaining Items - Rows */}
                                {remaining.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-bold text-[#D1D1D1] mb-4">All Trending</h2>
                                        <div className="space-y-2">
                                            {remaining.map((item, index) => (
                                                <TrendingRow
                                                    key={item.id}
                                                    item={item}
                                                    rank={index + 4}
                                                    onClick={() => handleCardClick(item)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Discovery */}
                    <DiscoverySidebar />
                </div>
            ) : (
                /* SIMPLE VIEW */
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
            )}

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

            {/* Expanded Playlist Modal - Guest Mode */}
            {selectedPlaylist && (
                <ExpandedPlaylistCard
                    playlist={selectedPlaylist}
                    onClose={() => setSelectedPlaylist(null)}
                />
            )}

            {/* Item Detail Modal - For Tracks and Albums */}
            {selectedItem && (
                <ItemDetailModal
                    itemId={selectedItem.id}
                    itemType={selectedItem.type}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
