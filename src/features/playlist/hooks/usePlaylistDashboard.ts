import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getEnhancedPlaylists, getPlaylistStats, getLatestTime, type EnhancedPlaylist } from '../services/playlist_services';
import type { FilterState, SortOptionType } from '../../../components/ui/FilterDropdown';

export interface UsePlaylistDashboardProps {
    source: "library" | "favourites";
}

// Storage keys for persistence
const STORAGE_KEYS = {
    sortDirection: 'playlists_sortDirection',
    activeSort: 'playlists_activeSort',
    filterState: 'playlists_filterState'
};

export const usePlaylistDashboard = ({ source }: UsePlaylistDashboardProps) => {
    const isLibrary = source === "library";

    // Load persisted values from localStorage
    const [activeSort, setActiveSortState] = useState<SortOptionType>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.activeSort);
        return (saved as SortOptionType) || 'created_at';
    });
    const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.sortDirection);
        return (saved === 'asc' || saved === 'desc') ? saved : 'asc';
    });

    // Filter state with persistence
    const [filterState, setFilterStateInternal] = useState<FilterState>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.filterState);
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return {
            ratingMode: 'global',
            minRating: 0,
            minRatingCount: 0,
            tagMode: 'global',
            selectedTags: [],
            onlyFavorites: false
        };
    });

    // Persist sort direction on change
    const setSortDirection = (dir: 'asc' | 'desc') => {
        setSortDirectionState(dir);
        localStorage.setItem(STORAGE_KEYS.sortDirection, dir);
    };
    // Persist active sort on change
    const setActiveSort = (sort: SortOptionType) => {
        setActiveSortState(sort);
        localStorage.setItem(STORAGE_KEYS.activeSort, sort);
    };
    // Persist filter state on change
    const setFilterState = (state: FilterState) => {
        setFilterStateInternal(state);
        localStorage.setItem(STORAGE_KEYS.filterState, JSON.stringify(state));
    };

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [playlists, setPlaylists] = useState<EnhancedPlaylist[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filterButtonRef = useRef<HTMLDivElement>(null);

    // --- 1. Initial Load (Bulk) ---
    const loadData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { playlists: enhancedData, favoriteIds: ids } = await getEnhancedPlaylists(session.user.id);

            setPlaylists(enhancedData);
            setFavoriteIds(ids);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Real-time Subscription ---
    // Debounced loadData to prevent rapid-fire API calls
    const loadDataDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const debouncedLoadData = useCallback(() => {
        if (loadDataDebounceRef.current) {
            clearTimeout(loadDataDebounceRef.current);
        }
        loadDataDebounceRef.current = setTimeout(() => {
            loadData();
        }, 500); // 500ms debounce
    }, []);

    const handleRealtimeUpdate = async (payload: RealtimePostgresChangesPayload<any>) => {
        const record = payload.new || payload.old;
        const playlistId = record?.item_id;

        if (!playlistId) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const stats = await getPlaylistStats(playlistId, session.user.id);

        setPlaylists(prev => prev.map(p => {
            if (p.id !== playlistId) return p;
            return { ...p, ...stats };
        }));
    };

    useEffect(() => {
        loadData();

        const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                loadData();
            }
            if (event === 'SIGNED_OUT') {
                setPlaylists([]);
                setFavoriteIds(new Set());
                setLoading(false);
            }
        });

        const channel = supabase.channel('playlist-dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ratings', filter: 'item_type=eq.playlist' }, (payload) => handleRealtimeUpdate(payload))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: 'item_type=eq.playlist' }, (payload) => handleRealtimeUpdate(payload))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'item_tags', filter: 'item_type=eq.playlist' }, (payload) => handleRealtimeUpdate(payload))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'playlists' }, () => debouncedLoadData())
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'playlists' }, (payload) => {
                const deletedId = payload.old?.id;
                if (deletedId) {
                    setPlaylists(prev => prev.filter(p => p.id !== deletedId));
                }
            })
            .subscribe();

        return () => {
            authSub.unsubscribe();
            supabase.removeChannel(channel);
            if (loadDataDebounceRef.current) {
                clearTimeout(loadDataDebounceRef.current);
            }
        };
    }, [source, debouncedLoadData]);

    const handlePlaylistReorder = (newOrder: EnhancedPlaylist[]) => {
        setPlaylists(newOrder);
        setActiveSort('custom');
    };

    const handleFavoriteToggle = (playlistId: string, isNowFavorite: boolean) => {
        setFavoriteIds(prev => {
            const newSet = new Set(prev);
            if (isNowFavorite) newSet.add(playlistId);
            else newSet.delete(playlistId);
            return newSet;
        });
    };

    const handlePlaylistUpdate = (playlistId: string, updates: Partial<EnhancedPlaylist>) => {
        setPlaylists(prev => prev.map(p =>
            p.id === playlistId ? { ...p, ...updates } : p
        ));
    };

    const hasActiveFilters = filterState.onlyFavorites || filterState.minRating > 0 || filterState.minRatingCount > 0 || filterState.selectedTags.length > 0;

    // --- Filtering & Sorting Logic ---
    const processPlaylists = () => {
        let processed = [...playlists];

        // 1. Search
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            processed = processed.filter(p =>
                p.title.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Favorites
        if (filterState.onlyFavorites) {
            processed = processed.filter(p => favoriteIds.has(p.id));
        }

        // 3. Rating Filter
        if (filterState.minRating > 0) {
            if (filterState.ratingMode === 'global') {
                processed = processed.filter(p => (p.rating_avg || 0) >= filterState.minRating);
            } else {
                processed = processed.filter(p => (p.user_rating || 0) >= filterState.minRating);
            }
        }

        // 3b. Min rating count filter (only for global mode)
        if (filterState.minRatingCount > 0 && filterState.ratingMode === 'global') {
            processed = processed.filter(p => (p.rating_count || 0) >= filterState.minRatingCount);
        }

        // 4. Tag Filter
        if (filterState.selectedTags.length > 0) {
            const targetTagsLower = filterState.selectedTags.map(t => t.toLowerCase());

            processed = processed.filter(p => {
                const sourceTags = filterState.tagMode === 'global' ? (p.tags || []) : (p.user_tags || []);
                return sourceTags.some(t => targetTagsLower.includes(t.toLowerCase()));
            });
        }

        // 5. Sorting
        if (activeSort !== 'custom') {
            processed.sort((a, b) => {
                let valA: any, valB: any;

                switch (activeSort) {
                    case 'alphabetical':
                        return sortDirection === 'asc'
                            ? a.title.localeCompare(b.title)
                            : b.title.localeCompare(a.title);

                    case 'created_at':
                        valA = new Date(getLatestTime(a)).getTime();
                        valB = new Date(getLatestTime(b)).getTime();
                        break;

                    case 'comment_count': valA = a.comment_count || 0; valB = b.comment_count || 0; break;
                    case 'track_count': valA = a.track_count || 0; valB = b.track_count || 0; break;

                    // Timestamps - push items without timestamps to the end, sort those alphabetically
                    case 'commented_at': {
                        const hasA = !!a.commented_at;
                        const hasB = !!b.commented_at;
                        if (!hasA && !hasB) return a.title.localeCompare(b.title);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
                        valA = new Date(a.commented_at!).getTime();
                        valB = new Date(b.commented_at!).getTime();
                        break;
                    }
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
                    case 'global_rated_at': {
                        const hasA = !!a.rated_at;
                        const hasB = !!b.rated_at;
                        if (!hasA && !hasB) return a.title.localeCompare(b.title);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
                        valA = new Date(a.rated_at!).getTime();
                        valB = new Date(b.rated_at!).getTime();
                        break;
                    }
                    case 'global_tag_count': valA = a.tag_count || 0; valB = b.tag_count || 0; break;
                    case 'global_tagged_at': {
                        const hasA = !!a.tagged_at;
                        const hasB = !!b.tagged_at;
                        if (!hasA && !hasB) return a.title.localeCompare(b.title);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
                        valA = new Date(a.tagged_at!).getTime();
                        valB = new Date(b.tagged_at!).getTime();
                        break;
                    }
                    case 'personal_rating': valA = a.user_rating || 0; valB = b.user_rating || 0; break;
                    case 'personal_rated_at': {
                        const hasA = !!a.user_rated_at;
                        const hasB = !!b.user_rated_at;
                        if (!hasA && !hasB) return a.title.localeCompare(b.title);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
                        valA = new Date(a.user_rated_at!).getTime();
                        valB = new Date(b.user_rated_at!).getTime();
                        break;
                    }
                    case 'personal_tag_count': valA = a.user_tag_count || 0; valB = b.user_tag_count || 0; break;
                    case 'personal_tagged_at': {
                        const hasA = !!a.user_tagged_at;
                        const hasB = !!b.user_tagged_at;
                        if (!hasA && !hasB) return a.title.localeCompare(b.title);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
                        valA = new Date(a.user_tagged_at!).getTime();
                        valB = new Date(b.user_tagged_at!).getTime();
                        break;
                    }
                    default: return 0;
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    // Smart Sort: 'asc' (Up Arrow) means Highest First for numbers (Ratings/Counts)
                    return sortDirection === 'asc' ? valB - valA : valA - valB;
                }
                return 0;
            });
        }

        return processed;
    };

    const displayedPlaylists = processPlaylists();


    return {
        // State
        activeSort, setActiveSort,
        sortDirection, setSortDirection,
        filterState, setFilterState,
        isFilterOpen, setIsFilterOpen,
        searchQuery, setSearchQuery,
        playlists: displayedPlaylists, // Return processed playlists
        favoriteIds,
        loading,
        showCreateModal, setShowCreateModal,
        isLibrary,
        hasActiveFilters,

        // Refs
        filterButtonRef,

        // Handlers
        loadData,
        handlePlaylistReorder,
        handleFavoriteToggle,
        handlePlaylistUpdate,

        // Utils
        setFilterStateFull: setFilterState, // In case we need raw setter
    };
};
