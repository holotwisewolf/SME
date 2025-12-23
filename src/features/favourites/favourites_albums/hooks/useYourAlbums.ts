import { useState, useEffect, useRef, useMemo } from 'react';
import { getFavouriteAlbums } from '../../services/favourites_services';
import { getMultipleAlbums } from '../../../spotify/services/spotify_services';
import { getMultipleItemStats } from '../../../../services/global_itemstats_services';
import { getUserItemRating } from '../../services/item_services';
import { getItemTags, getCurrentUserItemTags } from '../../../tags/services/tag_services';
import { supabase } from '../../../../lib/supabaseClient';
import { useError } from '../../../../context/ErrorContext';
import { parseSpotifyError } from '../../../spotify/services/spotifyConnection';
import type { SpotifyAlbum } from '../../../spotify/type/spotify_types';
import type { FilterState, SortOptionType } from '../../../../components/ui/FilterDropdown';

export interface EnhancedAlbum extends SpotifyAlbum {
    added_at?: string;
    rating_avg: number;
    rating_count: number;
    comment_count: number;
    user_rating: number;
    tags: string[];
    user_tags: string[];
    // Timestamps for sorting
    user_rated_at?: string;
    user_commented_at?: string;
    user_tagged_at?: string;
}

export const useYourAlbums = () => {
    const { showError } = useError();
    const [albums, setAlbums] = useState<EnhancedAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
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

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const favAlbums = await getFavouriteAlbums();

            if (favAlbums.length > 0) {
                const albumIds = favAlbums.map(f => f.item_id);
                // Map item_id -> created_at for 'Date Added' sort
                const addedAtMap = new Map(favAlbums.map(f => [f.item_id, f.created_at]));

                // Fetch data in parallel
                // Note: For large libraries, we might need batching, but for now fetch all (limit likely high enough)
                // If libraries > 50, getMultipleAlbums needs batching. Assuming < 50 for now or implementing batching later if needed.
                // Actually getMultipleAlbums usually takes max 20 or 50. Let's verify batching needs. 
                // Spotify API allows 20 albums per call.

                // Chunking logic
                const chunks = [];
                for (let i = 0; i < albumIds.length; i += 20) {
                    chunks.push(albumIds.slice(i, i + 20));
                }

                const allSpotifyAlbums: SpotifyAlbum[] = [];
                for (const chunk of chunks) {
                    const data = await getMultipleAlbums(chunk);
                    if (data && data.albums) {
                        allSpotifyAlbums.push(...data.albums.filter(Boolean));
                    }
                }

                const stats = await getMultipleItemStats(albumIds, 'album');
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

                // Batch fetch user timestamps (efficient - 3 queries total, not N+1)
                const [userRatingsRes, userCommentsRes, userTagsRes] = await Promise.all([
                    user ? supabase.from('ratings').select('item_id, rating, created_at, updated_at').eq('item_type', 'album').eq('user_id', user.id).in('item_id', albumIds) : { data: [] },
                    user ? supabase.from('comments').select('item_id, created_at').eq('item_type', 'album').eq('user_id', user.id).in('item_id', albumIds) : { data: [] },
                    user ? supabase.from('item_tags').select('item_id, created_at').eq('item_type', 'album').eq('user_id', user.id).in('item_id', albumIds) : { data: [] }
                ]);

                // Build maps for efficient lookup
                const userRatingsMap = new Map((userRatingsRes.data || []).map(r => [r.item_id, r]));
                const userCommentsMap = new Map<string, string>();
                (userCommentsRes.data || []).forEach(c => {
                    const existing = userCommentsMap.get(c.item_id);
                    if (!existing || new Date(c.created_at) > new Date(existing)) {
                        userCommentsMap.set(c.item_id, c.created_at);
                    }
                });
                const userTagsMap = new Map<string, string>();
                (userTagsRes.data || []).forEach(t => {
                    const existing = userTagsMap.get(t.item_id);
                    if (!existing || new Date(t.created_at) > new Date(existing)) {
                        userTagsMap.set(t.item_id, t.created_at);
                    }
                });

                const enhancedAlbums: EnhancedAlbum[] = await Promise.all(
                    allSpotifyAlbums.map(async (album) => {
                        const itemStats = statsMap.get(album.id);
                        const userRating = userRatingsMap.get(album.id);

                        const [globalTags, userTags] = await Promise.all([
                            getItemTags(album.id, 'album').catch(() => []),
                            user ? getCurrentUserItemTags(album.id, 'album').catch(() => []) : []
                        ]);

                        // Get latest timestamp for rating (created_at or updated_at)
                        const ratedAt = userRating ? (userRating.updated_at && new Date(userRating.updated_at) > new Date(userRating.created_at) ? userRating.updated_at : userRating.created_at) : undefined;

                        return {
                            ...album,
                            added_at: addedAtMap.get(album.id),
                            rating_avg: itemStats?.average_rating ?? 0,
                            rating_count: itemStats?.rating_count ?? 0,
                            comment_count: itemStats?.comment_count ?? 0,
                            user_rating: userRating?.rating || 0,
                            tags: globalTags.map(t => t.name),
                            user_tags: userTags.map(t => t.name),
                            user_rated_at: ratedAt,
                            user_commented_at: userCommentsMap.get(album.id),
                            user_tagged_at: userTagsMap.get(album.id)
                        };
                    })
                );

                setAlbums(enhancedAlbums);
            } else {
                setAlbums([]);
            }
        } catch (error) {
            console.error('Error loading albums:', error);
            const msg = parseSpotifyError(error, 'Failed to load albums');
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    // filtering and sorting
    const processedAlbums = useMemo(() => {
        let result = [...albums];

        // 1. Search
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(album =>
                album.name.toLowerCase().includes(lowerQuery) ||
                album.artists.some(a => a.name.toLowerCase().includes(lowerQuery))
            );
        }

        // 2. Rating Filter
        if (filterState.minRating > 0) {
            if (filterState.ratingMode === 'global') {
                result = result.filter(a => a.rating_avg >= filterState.minRating);
            } else {
                result = result.filter(a => a.user_rating >= filterState.minRating);
            }
        }

        // 2b. Min rating count filter (only for global mode)
        if (filterState.minRatingCount > 0 && filterState.ratingMode === 'global') {
            result = result.filter(a => a.rating_count >= filterState.minRatingCount);
        }

        // 3. Tag Filter
        if (filterState.selectedTags.length > 0) {
            const targetTagsLower = filterState.selectedTags.map(t => t.toLowerCase());
            result = result.filter(a => {
                const sourceTags = filterState.tagMode === 'global' ? a.tags : a.user_tags;
                return sourceTags.some(t => targetTagsLower.includes(t.toLowerCase()));
            });
        }

        // 4. Sorting
        result.sort((a, b) => {
            let valA: any = 0, valB: any = 0;

            switch (activeSort) {
                case 'alphabetical':
                    return sortDirection === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);

                case 'created_at':
                    valA = new Date(a.added_at || 0).getTime();
                    valB = new Date(b.added_at || 0).getTime();
                    break;

                case 'global_rating_avg': valA = a.rating_avg || 0; valB = b.rating_avg || 0; break;
                case 'global_rating_count': {
                    // Primary: rating count, Secondary: if same count, higher rating first
                    const countA = a.rating_count || 0;
                    const countB = b.rating_count || 0;
                    if (countA !== countB) {
                        valA = countA; valB = countB;
                    } else {
                        valA = a.rating_avg || 0;
                        valB = b.rating_avg || 0;
                    }
                    break;
                }
                case 'personal_rating': valA = a.user_rating || 0; valB = b.user_rating || 0; break;
                case 'comment_count': valA = a.comment_count || 0; valB = b.comment_count || 0; break;

                // Track count (from SpotifyAlbum) - default to 0 if undefined
                case 'track_count':
                    valA = a.total_tracks ?? 0;
                    valB = b.total_tracks ?? 0;
                    break;

                // Timestamps - push items without timestamps to the end, sort those alphabetically
                case 'personal_rated_at': {
                    const hasA = !!a.user_rated_at;
                    const hasB = !!b.user_rated_at;
                    if (!hasA && !hasB) return a.name.localeCompare(b.name); // Secondary sort alphabetically
                    if (!hasA) return 1; // Push A to end
                    if (!hasB) return -1; // Push B to end
                    valA = new Date(a.user_rated_at!).getTime();
                    valB = new Date(b.user_rated_at!).getTime();
                    break;
                }
                case 'commented_at': {
                    const hasA = !!a.user_commented_at;
                    const hasB = !!b.user_commented_at;
                    if (!hasA && !hasB) return a.name.localeCompare(b.name);
                    if (!hasA) return 1;
                    if (!hasB) return -1;
                    valA = new Date(a.user_commented_at!).getTime();
                    valB = new Date(b.user_commented_at!).getTime();
                    break;
                }
                case 'personal_tagged_at': {
                    const hasA = !!a.user_tagged_at;
                    const hasB = !!b.user_tagged_at;
                    if (!hasA && !hasB) return a.name.localeCompare(b.name);
                    if (!hasA) return 1;
                    if (!hasB) return -1;
                    valA = new Date(a.user_tagged_at!).getTime();
                    valB = new Date(b.user_tagged_at!).getTime();
                    break;
                }

                default:
                    // Fallback - no sorting
                    return 0;
            }

            // Numerical Sort Direction Logic (Inverted for intuitive feel)
            // 'asc' (Up Arrow) -> Highest First (Standard Descending)
            // 'desc' (Down Arrow) -> Lowest First (Standard Ascending)
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valB - valA : valA - valB;
            }

            return 0;
        });

        return result;
    }, [albums, searchQuery, filterState, activeSort, sortDirection]);

    // For LibraryAlbums.tsx compatibility
    const hasActiveFilters = filterState.minRating > 0 || filterState.selectedTags.length > 0;
    const processedAlbumIds = useMemo(() => processedAlbums.map(a => a.id), [processedAlbums]);

    return {
        albums: processedAlbums,
        loading,
        loadAlbums,
        searchQuery, setSearchQuery,
        sortDirection, setSortDirection,
        activeSort, setActiveSort,
        isFilterOpen, setIsFilterOpen,
        filterState, setFilterState,
        filterButtonRef,
        // Additional exports for LibraryAlbums.tsx
        hasActiveFilters,
        processedAlbumIds
    };
};
