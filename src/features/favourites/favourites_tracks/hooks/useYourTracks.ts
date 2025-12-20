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

export interface EnhancedTrack extends SpotifyTrack {
    added_at?: string;
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    user_rating?: number;
    tags?: string[];
    user_tags?: string[];
}

export const useYourTracks = () => {
    const [tracks, setTracks] = useState<EnhancedTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [activeSort, setActiveSort] = useState<SortOptionType>('created_at');
    const [activeId, setActiveId] = useState<string | null>(null);

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
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

                const enhancedTracks: EnhancedTrack[] = await Promise.all(
                    data.tracks.map(async (track: SpotifyTrack) => {
                        const itemStats = statsMap.get(track.id);

                        const [userRating, globalTags, userTags] = await Promise.all([
                            user ? getUserItemRating(track.id, 'track').catch(() => null) : null,
                            getItemTags(track.id, 'track').catch(() => []),
                            user ? getCurrentUserItemTags(track.id, 'track').catch(() => []) : []
                        ]);

                        return {
                            ...track,
                            added_at: addedAtMap.get(track.id),
                            rating_avg: itemStats?.average_rating ?? 0,
                            rating_count: itemStats?.rating_count ?? 0,
                            comment_count: itemStats?.comment_count ?? 0,
                            user_rating: userRating || 0,
                            tags: globalTags.map(t => t.name),
                            user_tags: userTags.map(t => t.name)
                        };
                    })
                );

                setTracks(enhancedTracks);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
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

        // 3. Tag filter
        if (filterState.selectedTags.length > 0) {
            const targetTags = filterState.selectedTags.map(t => t.toLowerCase());
            processed = processed.filter(t => {
                const sourceTags = filterState.tagMode === 'global' ? (t.tags || []) : (t.user_tags || []);
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
                        valA = a.added_at ? new Date(a.added_at).getTime() : 0;
                        valB = b.added_at ? new Date(b.added_at).getTime() : 0;
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
