import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import PlaylistGrid from './PlaylistGrid';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { usePlaylistDashboard } from '../hooks/usePlaylistDashboard';

interface PlaylistDashboardProps {
  source: "library" | "favourites";
}

const PlaylistDashboard: React.FC<PlaylistDashboardProps> = ({ source }) => {
  const {
    // State
    activeSort, setActiveSort,
    sortDirection, setSortDirection,
    filterState, setFilterState,
    isFilterOpen, setIsFilterOpen,
    searchQuery, setSearchQuery,
    playlists,
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
  } = usePlaylistDashboard({ source });

  return (
    <div className="flex flex-col h-full px-6 relative pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-2 mt-6">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
            {isLibrary ? "Your Playlists" : "Your Favourites"}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 relative">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search playlists..." />

          <div ref={filterButtonRef} onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }} className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${isFilterOpen || hasActiveFilters ? 'bg-[#FFD1D1] text-black' : 'bg-[#292929] text-gray-400 hover:text-white'}`}>
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
            onClearAll={() => { setFilterState({ minRating: 0, minRatingCount: 0, tagMode: 'global', ratingMode: 'global', selectedTags: [], onlyFavorites: false }); setActiveSort('created_at'); setSortDirection('desc'); }}
            hiddenSorts={[
              'global_rated_at',
              'global_tagged_at'
            ]}
          />

          <LayoutGroup id="playlist-sort">
            <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate ml-2">
              <button type="button" onClick={() => setSortDirection('asc')} className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`} title="Ascending">
                {sortDirection === 'asc' && (<motion.div layoutId="playlistSortIndicator" className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}
                <AscendingButton className="w-4 h-4" color="currentColor" />
              </button>
              <button type="button" onClick={() => setSortDirection('desc')} className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortDirection === 'desc' ? 'text-white' : 'text-gray-400 hover:text-white'}`} title="Descending">
                {sortDirection === 'desc' && (<motion.div layoutId="playlistSortIndicator" className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}
                <DescendingButton className="w-4 h-4" color="currentColor" />
              </button>
            </div>
          </LayoutGroup>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner className="w-10 h-10 text-[white]" /></div>
      ) : (
        <PlaylistGrid playlists={playlists} onDelete={loadData} onReorder={handlePlaylistReorder} favoriteIds={favoriteIds} onToggleFavorite={handleFavoriteToggle} onPlaylistUpdate={handlePlaylistUpdate} />
      )}
      {isLibrary && (
        <div className="fixed bottom-8 right-8 z-50">
          <button type="button" onClick={() => setShowCreateModal(true)} className="bg-[#1a1a1a] text-[#BAFFB5] text-sm font-medium rounded-full px-12 py-4 shadow-lg hover:bg-[#252525] transition">Create Playlist</button>
        </div>
      )}
      {showCreateModal && <CreatePlaylistModal onClose={() => setShowCreateModal(false)} onCreated={loadData} />}
    </div>
  );
};

export default PlaylistDashboard;