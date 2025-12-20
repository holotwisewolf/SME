import React, { useEffect, useState, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { getFavouriteAlbums } from '../../features/favourites/services/favourites_services';
import { getMultipleAlbums } from '../../features/spotify/services/spotify_services';
import { getUserItemRating } from '../../features/favourites/services/item_services';
import { getMultipleItemStats } from '../../services/global_itemstats_services';
import { getItemTags, getCurrentUserItemTags } from '../../features/tags/services/tag_services';
import AlbumGrid from '../../features/favourites/favourites_albums/components/AlbumGrid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AscendingButton from '../../components/ui/AscendingButton';
import DescendingButton from '../../components/ui/DescendingButton';
import FilterButton from '../../components/ui/FilterButton';
import SearchField from '../../components/ui/SearchField';
import FilterDropdown, { type FilterState, type SortOptionType } from '../../components/ui/FilterDropdown';
import { supabase } from '../../lib/supabaseClient';

// Enhanced album with rating/tag data for filtering
// Enhanced album with rating/tag data for filtering
interface EnhancedAlbum {
    id: string;
    name: string;
    created_at?: string; // For sorting by time
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    user_rating?: number;
    tags?: string[];
    user_tags?: string[];
}

const LibraryAlbums: React.FC = () => {
    const [albums, setAlbums] = useState<EnhancedAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [activeSort, setActiveSort] = useState<SortOptionType>('created_at');

    // Filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>({
        ratingMode: 'global',
        minRating: 0,
        tagMode: 'global',
        selectedTags: [],
        onlyFavorites: false
    });
    const filterButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const favAlbums = await getFavouriteAlbums(); // Returns { item_id, created_at }[]

            if (favAlbums.length > 0) {
                const albumIds = favAlbums.map(f => f.item_id);
                // Create lookup map for added_at
                const addedAtMap = new Map(favAlbums.map(f => [f.item_id, f.created_at]));

                // Fetch basic album data from Spotify + our metadata
                // Note: getMultipleAlbums returns SpotifyAlbum objects. We need to map them.
                const { albums: spotifyAlbums } = await getMultipleAlbums(albumIds);

                // Fetch stats for all albums in one go (efficient)
                const stats = await getMultipleItemStats(albumIds, 'album');
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

                // Enhance albums with rating/tag data
                const enhanced: EnhancedAlbum[] = await Promise.all(
                    spotifyAlbums.map(async (album: any) => {
                        const itemStats = statsMap.get(album.id);

                        const [userRating, globalTags, userTags] = await Promise.all([
                            user ? getUserItemRating(album.id, 'album').catch(() => null) : null,
                            getItemTags(album.id, 'album').catch(() => []),
                            user ? getCurrentUserItemTags(album.id, 'album').catch(() => []) : []
                        ]);

                        return {
                            id: album.id,
                            name: album.name,
                            created_at: addedAtMap.get(album.id), // Use local favorite added_at
                            rating_avg: itemStats?.average_rating ?? 0,
                            rating_count: itemStats?.rating_count ?? 0,
                            comment_count: itemStats?.comment_count ?? 0,
                            user_rating: userRating || 0,
                            tags: globalTags.map((t: any) => t.name),
                            user_tags: userTags.map((t: any) => t.name)
                        };
                    })
                );

                setAlbums(enhanced);
            } else {
                setAlbums([]);
            }
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters = filterState.minRating > 0 || filterState.selectedTags.length > 0;

    // Process albums with filters and sorting
    const processedAlbumIds = (() => {
        let processed = [...albums];

        // 1. Search filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            processed = processed.filter(album =>
                album.name.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Rating filter
        if (filterState.minRating > 0) {
            if (filterState.ratingMode === 'global') {
                processed = processed.filter(a => (a.rating_avg || 0) >= filterState.minRating);
            } else {
                processed = processed.filter(a => (a.user_rating || 0) >= filterState.minRating);
            }
        }

        // 3. Tag filter
        if (filterState.selectedTags.length > 0) {
            const targetTags = filterState.selectedTags.map(t => t.toLowerCase());
            processed = processed.filter(a => {
                const sourceTags = filterState.tagMode === 'global' ? (a.tags || []) : (a.user_tags || []);
                return sourceTags.some(tag => targetTags.includes(tag.toLowerCase()));
            });
        }

        // 4. Sorting
        if (activeSort !== 'custom') {
            processed.sort((a, b) => {
                let valA: any, valB: any;

                switch (activeSort) {
                    case 'alphabetical':
                        return sortDirection === 'asc'
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    case 'created_at':
                        valA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        valB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        break;
                    case 'global_rating_avg': valA = a.rating_avg || 0; valB = b.rating_avg || 0; break;
                    case 'global_rating_count': valA = a.rating_count || 0; valB = b.rating_count || 0; break;
                    case 'personal_rating': valA = a.user_rating || 0; valB = b.user_rating || 0; break;
                    case 'global_tag_count': valA = a.tags?.length || 0; valB = b.tags?.length || 0; break;
                    case 'personal_tag_count': valA = a.user_tags?.length || 0; valB = b.user_tags?.length || 0; break;
                    // Fallbacks for unimplemented sorts (prevent crash/random order)
                    case 'comment_count': valA = a.comment_count || 0; valB = b.comment_count || 0; break;
                    case 'commented_at':
                    case 'global_rated_at':
                    case 'personal_rated_at':
                    case 'global_tagged_at':
                    case 'personal_tagged_at':
                        valA = 0; valB = 0; break;
                    default: return 0;
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDirection === 'asc' ? valA - valB : valB - valA;
                }
                return 0;
            });
        }

        return processed.map(a => a.id);
    })();


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full px-6 relative pb-32 bg-[#696969]">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 pt-2 mt-6">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
                        Favourited Albums
                    </h1>
                </div>

                {/* Sorting & Filtering Controls (Right Aligned) */}
                <div className="flex items-center gap-3 relative">
                    {/* Search Bar - Always visible */}
                    <SearchField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search albums..."
                    />

                    {/* Filter Button */}
                    <div
                        ref={filterButtonRef}
                        onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${isFilterOpen || hasActiveFilters ? 'bg-[#FFD1D1] text-black' : 'bg-[#292929] text-gray-400 hover:text-white'}`}
                    >
                        <FilterButton className="w-5 h-5" color="currentColor" isActive={isFilterOpen} />
                    </div>

                    <FilterDropdown
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        anchorRef={filterButtonRef as React.RefObject<HTMLElement>}
                        currentFilter={filterState}
                        currentSort={activeSort}
                        onFilterChange={setFilterState}
                        onSortChange={setActiveSort}
                        onClearAll={() => {
                            setFilterState({ minRating: 0, tagMode: 'global', ratingMode: 'global', selectedTags: [], onlyFavorites: false });
                            setActiveSort('alphabetical');
                            setSortDirection('desc');
                        }}
                        showFavoritesFilter={false}
                        hiddenSorts={[
                            'commented_at',
                            'global_rated_at',
                            'personal_rated_at',
                            'global_tagged_at',
                            'personal_tagged_at'
                        ]}
                    />

                    {/* Sort Toggle - Wrapped in LayoutGroup to isolate animations */}
                    <LayoutGroup id="album-sort">
                        <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate ml-2">
                            <button
                                onClick={() => setSortDirection('asc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Ascending"
                            >
                                {sortDirection === 'asc' && (
                                    <motion.div
                                        layoutId="albumSortIndicator"
                                        className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <AscendingButton className="w-4 h-4" color="currentColor" />
                            </button>

                            <button
                                onClick={() => setSortDirection('desc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'desc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Descending"
                            >
                                {sortDirection === 'desc' && (
                                    <motion.div
                                        layoutId="albumSortIndicator"
                                        className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <DescendingButton className="w-4 h-4" color="currentColor" />
                            </button>
                        </div>
                    </LayoutGroup>
                </div>
            </div>
            <AlbumGrid albums={processedAlbumIds} onDelete={loadAlbums} searchQuery={searchQuery} />
        </div>
    );
};

export default LibraryAlbums;

