import { useState, useEffect, useRef, useMemo } from 'react';
import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { getFavouriteTracks } from '../../services/favourites_services';
import { getMultipleTracks } from '../../../spotify/services/spotify_services';
import { getUserItemRating } from '../../services/item_services';
import { getMultipleItemStats } from '../../../../services/global_itemstats_services';
import { getItemTags, getCurrentUserItemTags } from '../../../tags/services/tag_services';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';
import type { FilterState, SortOptionType } from '../../../../components/ui/FilterDropdown';
import { supabase } from '../../../../lib/supabaseClient';
import { useError } from '../../../../context/ErrorContext';
import { parseSpotifyError } from '../../../spotify/services/spotifyConnection';

export interface EnhancedTrack extends SpotifyTrack {
    added_at?: string;
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    user_rating?: number;
    tags?: string[];
    user_tags?: string[];
    // Timestamps for sorting
    user_rated_at?: string;
    user_commented_at?: string;
    user_tagged_at?: string;
}

export const useYourTracks = () => {
    const { showError } = useError();
    const [tracks, setTracks] = useState<EnhancedTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [activeSort, setActiveSort] = useState<SortOptionType>('created_at');
    const [activeId, setActiveId] = useState<string | null>(null);

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const favTracks = await getFavouriteTracks();

            if (favTracks.length > 0) {
                const trackIds = favTracks.map(f => f.item_id);
                const addedAtMap = new Map(favTracks.map(f => [f.item_id, f.created_at]));

                // Fetch in batches of 50
                const batch = trackIds.slice(0, 50);
                const data = await getMultipleTracks(batch);

                const stats = await getMultipleItemStats(batch, 'track');
                console.log('[YourTracks] Fetched item_stats for', batch.length, 'tracks:', stats.length, 'stats found');
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

                // Batch fetch user timestamps (efficient - 3 queries total, not N+1)
                const [userRatingsRes, userCommentsRes, userTagsRes] = await Promise.all([
                    user ? supabase.from('ratings').select('item_id, rating, created_at, updated_at').eq('item_type', 'track').eq('user_id', user.id).in('item_id', batch) : { data: [] },
                    user ? supabase.from('comments').select('item_id, created_at').eq('item_type', 'track').eq('user_id', user.id).in('item_id', batch) : { data: [] },
                    user ? supabase.from('item_tags').select('item_id, created_at').eq('item_type', 'track').eq('user_id', user.id).in('item_id', batch) : { data: [] }
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

                const enhancedTracks: EnhancedTrack[] = await Promise.all(
                    data.tracks.map(async (track: SpotifyTrack) => {
                        const itemStats = statsMap.get(track.id);
                        const userRating = userRatingsMap.get(track.id);

                        const [globalTags, userTags] = await Promise.all([
                            getItemTags(track.id, 'track').catch(() => []),
                            user ? getCurrentUserItemTags(track.id, 'track').catch(() => []) : []
                        ]);

                        // Get latest timestamp for rating (created_at or updated_at)
                        const ratedAt = userRating ? (userRating.updated_at && new Date(userRating.updated_at) > new Date(userRating.created_at) ? userRating.updated_at : userRating.created_at) : undefined;

                        return {
                            ...track,
                            added_at: addedAtMap.get(track.id),
                            rating_avg: itemStats?.average_rating ?? 0,
                            rating_count: itemStats?.rating_count ?? 0,
                            comment_count: itemStats?.comment_count ?? 0,
                            user_rating: userRating?.rating || 0,
                            tags: globalTags.map(t => t.name),
                            user_tags: userTags.map(t => t.name),
                            user_rated_at: ratedAt,
                            user_commented_at: userCommentsMap.get(track.id),
                            user_tagged_at: userTagsMap.get(track.id)
                        };
                    })
                );



                console.log('[YourTracks] Final enhanced tracks:', enhancedTracks.length);
                setTracks(enhancedTracks);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
            const msg = parseSpotifyError(error, 'Failed to load tracks');
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
        setActiveSort('custom');
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setTracks((items) => {
                const oldIndex = items.findIndex((item) => item && item.id === active.id);
                const newIndex = items.findIndex((item) => item && item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const hasActiveFilters = filterState.minRating > 0 || filterState.selectedTags.length > 0;

    const processedTracks = useMemo(() => {
        let processed = [...tracks];

        // 1. Search filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            processed = processed.filter(track =>
                track.name.toLowerCase().includes(lowerQuery) ||
                (track.artists && track.artists.some((a: any) => a?.name?.toLowerCase().includes(lowerQuery)))
            );
        }

        // 2. Rating filter
        if (filterState.minRating > 0) {
            if (filterState.ratingMode === 'global') {
                processed = processed.filter(t => (t.rating_avg || 0) >= filterState.minRating);
            } else {
                processed = processed.filter(t => (t.user_rating || 0) >= filterState.minRating);
            }
        }

        // 2b. Min rating count filter (only for global mode)
        if (filterState.minRatingCount > 0 && filterState.ratingMode === 'global') {
            processed = processed.filter(t => (t.rating_count || 0) >= filterState.minRatingCount);
        }

        // 3. Tag filter
        if (filterState.selectedTags.length > 0) {
            const targetTags = filterState.selectedTags.map(t => t.toLowerCase());
            processed = processed.filter(t => {
                const sourceTags = filterState.tagMode === 'global' ? (t.tags || []) : (t.user_tags || []);
                return sourceTags.some(tag => targetTags.includes(tag.toLowerCase()));
            });
        }

        // 4. Sorting
        // UX NOTE: 'asc' (up arrow) = highest values at top (best first)
        //          'desc' (down arrow) = lowest values at top
        if (activeSort !== 'custom') {
            processed.sort((a, b) => {
                let valA: any, valB: any;

                switch (activeSort) {
                    case 'alphabetical':
                        // For alphabetical: 'asc' = A→Z at top, 'desc' = Z→A at top
                        return sortDirection === 'asc'
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    case 'created_at':
                        valA = a.added_at ? new Date(a.added_at).getTime() : 0;
                        valB = b.added_at ? new Date(b.added_at).getTime() : 0;
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
                    case 'global_tag_count': valA = a.tags?.length || 0; valB = b.tags?.length || 0; break;
                    case 'personal_tag_count': valA = a.user_tags?.length || 0; valB = b.user_tags?.length || 0; break;
                    case 'comment_count': valA = a.comment_count || 0; valB = b.comment_count || 0; break;

                    // Timestamps - push items without timestamps to the end, sort those alphabetically
                    case 'personal_rated_at': {
                        const hasA = !!a.user_rated_at;
                        const hasB = !!b.user_rated_at;
                        if (!hasA && !hasB) return a.name.localeCompare(b.name);
                        if (!hasA) return 1;
                        if (!hasB) return -1;
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
                    // Global timestamps not fetched yet, just return 0
                    case 'global_rated_at':
                    case 'global_tagged_at':
                        valA = 0; valB = 0; break;
                    default: return 0;
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    // INVERTED: 'asc' = highest first (valB - valA), 'desc' = lowest first (valA - valB)
                    return sortDirection === 'asc' ? valB - valA : valA - valB;
                }
                return 0;
            });
        }

        return processed;
    }, [tracks, searchQuery, filterState, activeSort, sortDirection]);

    const activeTrack = activeId ? tracks.find(t => t && t.id === activeId) : null;

    return {
        tracks, setTracks,
        loading,
        selectedTrack, setSelectedTrack,
        searchQuery, setSearchQuery,
        sortDirection, setSortDirection,
        activeSort, setActiveSort,
        activeId,
        isFilterOpen, setIsFilterOpen,
        filterState, setFilterState,
        filterButtonRef,
        sensors,
        handleDragStart,
        handleDragEnd,
        hasActiveFilters,
        processedTracks,
        activeTrack
    };
};
