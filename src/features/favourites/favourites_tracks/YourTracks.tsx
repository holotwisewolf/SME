import React from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';

import {
    DndContext,
    closestCenter,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { TrackCard } from './components/TrackCard';
import { SortableTrackCard } from './components/SortableTrackCard';
import { TrackReviewModal } from './components/expanded_card/TrackReviewModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import { useYourTracks } from './hooks/useYourTracks';

const YourTracks: React.FC = () => {
    const {
        setTracks,
        loading,
        selectedTrack, setSelectedTrack,
        searchQuery, setSearchQuery,
        sortDirection, setSortDirection,
        activeSort, setActiveSort,
        isFilterOpen, setIsFilterOpen,
        filterState, setFilterState,
        filterButtonRef,
        sensors,
        handleDragStart,
        handleDragEnd,
        hasActiveFilters,
        processedTracks,
        activeTrack
    } = useYourTracks();

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
                            'track_count', // Only for albums/playlists
                            'global_rated_at',
                            'global_tagged_at'
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
