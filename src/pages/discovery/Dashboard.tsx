// Dashboard Page - Main community discovery dashboard

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroCard from '../../features/trending/components/HeroCard';
import FeaturedBanner from '../../features/trending/components/FeaturedBanner';
import TrendingRow from '../../features/trending/components/TrendingRow';
import TrendingCard from '../../features/trending/components/TrendingCard';
import TrendingFilters from '../../features/trending/components/TrendingFilters';
import DiscoverySidebar from '../../features/trending/components/DiscoverySidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getTrendingTracks, getTrendingAlbums, getTrendingPlaylists } from '../../features/trending/services/trending_services';
import { ExpandedPlaylistCard } from '../../features/playlist/components/expanded_card/ExpandedPlaylistCard';
import { TrackReviewModal } from '../../features/favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { ItemDetailModal } from '../../features/trending/components/ItemDetailModal';
import { getTrackDetails } from '../../features/spotify/services/spotify_services';
import { supabase } from '../../lib/supabaseClient';
import type { TrendingItem, TrendingFilters as TrendingFiltersType } from '../../features/trending/types/trending';
import type { SpotifyTrack } from '../../features/spotify/type/spotify_types';

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
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'track' | 'album' } | null>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const [hoveringScrollIndicator, setHoveringScrollIndicator] = useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const allTrendingRef = React.useRef<HTMLHeadingElement>(null);

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
        } else if (item.type === 'track') {
            console.log('Track clicked:', item.id);
            try {
                // Fetch full track data from Spotify
                const trackData = await getTrackDetails(item.id);
                console.log('Track data fetched:', trackData);
                if (trackData) {
                    setSelectedTrack(trackData);
                } else {
                    console.error('No track data returned');
                }
            } catch (error) {
                console.error('Error fetching track:', error);
                // Fallback to simple modal if track fetch fails
                setSelectedItem({ id: item.id, type: 'track' });
            }
        } else if (item.type === 'album') {
            // Show simple detail modal for albums
            setSelectedItem({ id: item.id, type: 'album' });
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Title */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">Dashboard</h1>
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
                    <div className="flex-1 flex flex-col min-w-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl overflow-hidden">
                        {/* Tab Navigation - Fixed Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
                            <div className="flex gap-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === tab.value
                                            ? 'bg-[#FFD1D1] text-black border border-[#FFD1D1]'
                                            : 'bg-[#1a1a1a] text-[#D1D1D1]/70 hover:text-[#D1D1D1] border border-[#D1D1D1]/20 hover:border-[#FFD1D1]/30'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[#D1D1D1]/60">Sort by:</span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                                    className="bg-[#1a1a1a] border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer"
                                >
                                    <option value="trending">Trending</option>
                                    <option value="top-rated">Top Rated</option>
                                    <option value="most-ratings">Most Ratings</option>
                                    <option value="most-commented">Most Comments</option>
                                    <option value="most-favorited">Most Favorited</option>
                                    <option value="most-activity">Recent Activity</option>
                                    <option value="newly-tagged">Newly Tagged</option>
                                </select>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col min-h-0 p-6">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <LoadingSpinner />
                                </div>
                            ) : trendingItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <p className="text-[#D1D1D1]/60 text-lg mb-2">No trending items found</p>
                                    <p className="text-[#D1D1D1]/40 text-sm">Try adjusting your filters</p>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => setFilters({ timeRange: 'week', sortBy: 'top-rated' })}
                                            className="px-3 py-1.5 bg-[#292929] border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-lg hover:bg-[#FFD1D1]/10 transition-colors"
                                        >
                                            Reset Filters
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
                            ) : (
                                <div className="flex-1 relative flex flex-col min-h-0">
                                    {/* Scrollable Content - Hidden Scrollbar */}
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex-1 overflow-y-auto scrollbar-hide pr-2"
                                        onScroll={(e) => {
                                            const target = e.currentTarget;
                                            // Show indicator when at top, hide after minimal scroll
                                            const hasScrolled = target.scrollTop > 50;
                                            setShowScrollIndicator(!hasScrolled);
                                        }}
                                    >
                                        {/* Top 3 Items - Different display based on tab */}
                                        {topThree.length > 0 && (
                                            <>
                                                {activeTab === 'tracks' ? (
                                                    /* Tracks: Show vertical grid of HeroCards */
                                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                                        {topThree.map((item, index) => (
                                                            <HeroCard
                                                                key={item.id}
                                                                item={item}
                                                                rank={index + 1}
                                                                onClick={() => handleCardClick(item)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    /* Playlists/Albums: Show FeaturedBanner */
                                                    <FeaturedBanner
                                                        topItem={topThree[0]}
                                                        topThree={topThree}
                                                        onItemClick={handleCardClick}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {/* Scroll Indicator - Overlayed at Bottom of Banner */}
                                        <motion.div
                                            initial={{ opacity: 0.3 }}
                                            animate={{ opacity: showScrollIndicator && remaining.length > 0 ? (hoveringScrollIndicator ? 0.8 : 0.3) : 0 }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                            className="absolute bottom-0 left-0 right-0 cursor-pointer z-20"
                                            onClick={() => {
                                                allTrendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                            onMouseEnter={() => setHoveringScrollIndicator(true)}
                                            onMouseLeave={() => setHoveringScrollIndicator(false)}
                                            style={{ pointerEvents: showScrollIndicator ? 'auto' : 'none' }}
                                        >
                                            {/* Soft Glow Effect on Bottom Edge */}
                                            <motion.div
                                                animate={{ opacity: hoveringScrollIndicator && showScrollIndicator ? 0.3 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute -bottom-2 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent blur-xl pointer-events-none"
                                            />

                                            {/* Arrow Icon */}
                                            <div className="flex justify-center">
                                                <svg viewBox="0 0 16 16" width="24" height="24" fill="white">
                                                    <path d="M13.2929 8.70714L8.00001 14L2.70712 8.70714L1.29291 10.1214L8.00001 16.8285L14.7071 10.1214L13.2929 8.70714Z" />
                                                </svg>
                                            </div>
                                        </motion.div>

                                        {/* Remaining Items - Rows */}
                                        {remaining.length > 0 && (
                                            <div>
                                                <h2 ref={allTrendingRef} className="text-lg font-bold text-[#D1D1D1] mb-4">Rankings</h2>
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
                                </div>
                            )}
                        </div>
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

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Item Detail Modal - For Albums */}
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
