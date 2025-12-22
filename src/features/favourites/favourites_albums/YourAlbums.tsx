import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import AlbumGrid from './components/AlbumGrid';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import { useYourAlbums } from './hooks/useYourAlbums';

const YourAlbums: React.FC = () => {
    const {
        albums,
        loading,
        loadAlbums,
        searchQuery, setSearchQuery,
        sortDirection, setSortDirection,
        activeSort, setActiveSort,
        isFilterOpen, setIsFilterOpen,
        filterState, setFilterState,
        filterButtonRef
    } = useYourAlbums();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    const hasActiveFilters = filterState.minRating > 0 || filterState.selectedTags.length > 0;

    return (
        <div className="flex flex-col h-full px-6 relative pb-32">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 pt-2 mt-6">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">Favourited Albums</h1>
                </div>

                {/* Sorting & Filtering Controls */}
                <div className="flex items-center gap-3 relative">
                    {/* Search Bar */}
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
                            setActiveSort('created_at');
                            setSortDirection('desc');
                        }}
                        showFavoritesFilter={false} // Already favourites page
                        hiddenSorts={[
                            'comment_count', // Hidden for now if desired, or keep
                            'commented_at',
                            'global_rated_at',
                            'personal_rated_at',
                            'global_tagged_at',
                            'personal_tagged_at',
                            'most-tracks' as any, // Hide unsupported sorts
                            'most-duration' as any
                        ]}
                    />

                    {/* Sort Toggle */}
                    <LayoutGroup id="valbum-sort">
                        <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate ml-2">
                            <button
                                onClick={() => setSortDirection('asc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Ascending"
                            >
                                {sortDirection === 'asc' && (
                                    <motion.div
                                        layoutId="valbumSortIndicator"
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
                                        layoutId="valbumSortIndicator"
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

            <AlbumGrid albums={albums} onDelete={loadAlbums} searchQuery={searchQuery} />
        </div>
    );
};

export default YourAlbums;
