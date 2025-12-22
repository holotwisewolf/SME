import { useState, useEffect, useRef, useMemo } from 'react';
import { getFavouriteAlbums } from '../../../features/favourites/services/favourites_services';
import { getMultipleAlbums } from '../../../features/spotify/services/spotify_services';
import { getUserItemRating } from '../../../features/favourites/services/item_services';
import { getMultipleItemStats } from '../../../services/global_itemstats_services';
import { getItemTags, getCurrentUserItemTags } from '../../../features/tags/services/tag_services';
import type { FilterState, SortOptionType } from '../../../components/ui/FilterDropdown';
import { supabase } from '../../../lib/supabaseClient';

export interface EnhancedAlbum {
    id: string;
    name: string;
    created_at?: string;
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    user_rating?: number;
    tags?: string[];
    user_tags?: string[];
}

export const useLibraryAlbums = () => {
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
        minRatingCount: 0,
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
            const favAlbums = await getFavouriteAlbums();

            if (favAlbums.length > 0) {
                const albumIds = favAlbums.map(f => f.item_id);
                const addedAtMap = new Map(favAlbums.map(f => [f.item_id, f.created_at]));

                const { albums: spotifyAlbums } = await getMultipleAlbums(albumIds);

                const stats = await getMultipleItemStats(albumIds, 'album');
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

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
                            created_at: addedAtMap.get(album.id),
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

    const processedAlbumIds = useMemo(() => {
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

        // 2b. Min rating count filter (only for global mode)
        if (filterState.minRatingCount > 0 && filterState.ratingMode === 'global') {
            processed = processed.filter(a => (a.rating_count || 0) >= filterState.minRatingCount);
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
    }, [albums, searchQuery, filterState, activeSort, sortDirection]);

    return {
        albums, setAlbums,
        loading,
        searchQuery, setSearchQuery,
        sortDirection, setSortDirection,
        activeSort, setActiveSort,
        isFilterOpen, setIsFilterOpen,
        filterState, setFilterState,
        filterButtonRef,
        loadAlbums,
        hasActiveFilters,
        processedAlbumIds
    };
};
