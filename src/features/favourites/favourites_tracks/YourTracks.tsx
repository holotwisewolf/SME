import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { getFavouriteTracks } from '../services/favourites_services';
import { getMultipleTracks } from '../../spotify/services/spotify_services';
import { getUserItemRating } from '../services/item_services';
import { getMultipleItemStats } from '../../../services/global_itemstats_services';
import { getItemTags, getCurrentUserItemTags } from '../../tags/services/tag_services';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import { TrackCard } from './components/TrackCard';
import { SortableTrackCard } from './components/SortableTrackCard';
import { TrackReviewModal } from './components/expanded_card/TrackReviewModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown, { type FilterState, type SortOptionType } from '../../../components/ui/FilterDropdown';
import { supabase } from '../../../lib/supabaseClient';

// Enhanced track with rating/tag data for filtering
interface EnhancedTrack extends SpotifyTrack {
    added_at?: string; // Date added to favorites
    rating_avg?: number;
    rating_count?: number;
    comment_count?: number;
    user_rating?: number;
    tags?: string[];
    user_tags?: string[];
}

const YourTracks: React.FC = () => {
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
            const favTracks = await getFavouriteTracks(); // Returns { item_id, created_at }[]

            if (favTracks.length > 0) {
                const trackIds = favTracks.map(f => f.item_id);
                // Create lookup map for added_at
                const addedAtMap = new Map(favTracks.map(f => [f.item_id, f.created_at]));

                // Fetch in batches of 50
                const batch = trackIds.slice(0, 50);
                const data = await getMultipleTracks(batch);

                // Fetch stats for all tracks in one go (efficient)
                const stats = await getMultipleItemStats(batch, 'track');
                const statsMap = new Map(stats.map(s => [s.item_id, s]));

                // Enhance tracks with rating/tag data
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
        // Set to custom sort when manually reordering
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

    // Process tracks with filters and sorting
    const processedTracks = (() => {
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
                        // Sort by date added
                        valA = a.added_at ? new Date(a.added_at).getTime() : 0;
                        valB = b.added_at ? new Date(b.added_at).getTime() : 0;
                        break;
                    case 'global_rating_avg': valA = a.rating_avg || 0; valB = b.rating_avg || 0; break;
                    case 'global_rating_count': valA = a.rating_count || 0; valB = b.rating_count || 0; break;
                    case 'personal_rating': valA = a.user_rating || 0; valB = b.user_rating || 0; break;
                    case 'global_tag_count': valA = a.tags?.length || 0; valB = b.tags?.length || 0; break;
                    case 'personal_tag_count': valA = a.user_tags?.length || 0; valB = b.user_tags?.length || 0; break;
                    // Fallbacks for unimplemented sorts (prevent crash/random order)
                    case 'comment_count': valA = a.comment_count || 0; valB = b.comment_count || 0; break;
                    // Fallbacks for unimplemented sorts (prevent crash/random order)
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
    })();

    const activeTrack = activeId ? tracks.find(t => t && t.id === activeId) : null;

    return (
        <div className="flex flex-col h-full px-6 relative pb-32">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 pt-2 mt-6">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
                        Favourited Tracks
                    </h1>
                </div>

                {/* Sorting & Filtering Controls (Right Aligned) */}
                <div className="flex items-center gap-3 relative">
                    {/* Search Bar - Always visible */}
                    <SearchField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search tracks..."
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
                        showFavoritesFilter={false} // Hidden for favorites page
                        hiddenSorts={[
                            'commented_at',
                            'global_rated_at',
                            'personal_rated_at',
                            'global_tagged_at',
                            'personal_tagged_at'
                        ]}
                    />

                    {/* Sort Toggle - Wrapped in LayoutGroup to isolate animations */}
                    <LayoutGroup id="track-sort">
                        <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate ml-2">
                            <button
                                onClick={() => setSortDirection('asc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Ascending"
                            >
                                {sortDirection === 'asc' && (
                                    <motion.div
                                        layoutId="trackSortIndicator"
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
                                        layoutId="trackSortIndicator"
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

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner className="w-10 h-10 text-[white]" />
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                        <SortableContext
                            items={processedTracks.map(t => t.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {processedTracks.map(track => (
                                    <SortableTrackCard
                                        key={track.id}
                                        track={track}
                                        onClick={() => setSelectedTrack(track)}
                                        isFavourite={true}
                                        onToggleFavourite={() => {
                                            // Remove from list if unfavourited
                                            setTracks(prev => prev.filter(t => t && t.id !== track.id));
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </div>

                    <DragOverlay>
                        {activeTrack ? (
                            <div className="w-full h-full">
                                <TrackCard
                                    track={activeTrack}
                                    onClick={() => { }}
                                    isFavourite={true}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedTrack && (
                    <TrackReviewModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                        onRemove={() => {
                            setTracks(prev => prev.filter(t => t && t.id !== selectedTrack.id));
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default YourTracks;
