import React, { useState, useEffect } from 'react';
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
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import { TrackCard } from './components/TrackCard';
import { SortableTrackCard } from './components/SortableTrackCard';
import { TrackReviewModal } from './components/expanded_card/TrackReviewModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';

const YourTracks: React.FC = () => {
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('asc');
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

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
            const trackIds = await getFavouriteTracks();
            if (trackIds.length > 0) {
                // Fetch in batches of 50
                const batch = trackIds.slice(0, 50);
                const data = await getMultipleTracks(batch);
                setTracks(data.tracks);
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
        // Clear sort order when manually reordering
        setSortOrder('none');
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

    const filteredTracks = tracks.filter(track => {
        if (!track || !track.name) return false;
        const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (track.artists && track.artists.some((a: any) => a?.name?.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesSearch;
    }).sort((a, b) => {
        if (!a?.name || !b?.name) return 0;
        if (sortOrder === 'none') return 0; // Preserve original order
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

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
                <div className="flex items-center gap-3">
                    {/* Search Bar - Always visible */}
                    <SearchField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search tracks..."
                    />

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterActive(!isFilterActive)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isFilterActive ? 'bg-[#FFD1D1] text-black' : 'bg-[#292929] text-gray-400 hover:text-white'}`}
                    >
                        <FilterButton className="w-5 h-5" color="currentColor" isActive={isFilterActive} />
                    </button>

                    {/* Sort Toggle - Wrapped in LayoutGroup to isolate animations */}
                    <LayoutGroup id="track-sort">
                        <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate">
                            <button
                                onClick={() => setSortOrder('asc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortOrder === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {sortOrder === 'asc' && (
                                    <motion.div
                                        layoutId="trackSortIndicator"
                                        className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <AscendingButton className="w-4 h-4" color="currentColor" />
                            </button>

                            <button
                                onClick={() => setSortOrder('desc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortOrder === 'desc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {sortOrder === 'desc' && (
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
                            items={filteredTracks.map(t => t.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {filteredTracks.map(track => (
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
