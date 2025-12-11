import React, { useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import PlaylistGrid from './PlaylistGrid';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import { getUserPlaylists } from '../services/playlist_services';
import type { Tables } from '../../../types/supabase';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { supabase } from '../../../lib/supabaseClient'; // [Change 1] Import Supabase


interface PlaylistDashboardProps {
  source: "library" | "favourites";
}

const PlaylistDashboard: React.FC<PlaylistDashboardProps> = ({ source }) => {
  const isLibrary = source === "library";
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [playlists, setPlaylists] = useState<Tables<'playlists'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const loadPlaylists = async () => {
    // Check session first to avoid errors
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        setLoading(false);
        return; 
    }

    setLoading(true);
    try {
      // TODO: Handle 'favourites' source differently when implemented
      const data = await getUserPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadPlaylists();

    //  Auth State Listener for Auto-Refresh on Login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            loadPlaylists();
        }
        if (event === 'SIGNED_OUT') {
            setPlaylists([]);
            setLoading(false);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [source]);

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  return (
    <div className="flex flex-col h-full px-6 relative pb-32">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pt-2 mt-6">
        <div className="flex items-center gap-6">
          <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
            {isLibrary ? "Your Playlists" : "Your Favourites"}
          </h1>
        </div>

        {/* Sorting & Filtering Controls (Right Aligned) */}
        <div className="flex items-center gap-3 relative">
          {/* Search Bar - Always visible */}
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search playlists..."
          />

          {/* Filter Button */}
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterActive(!isFilterActive)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isFilterActive ? 'bg-[#FFD1D1] text-black' : 'bg-[#292929] text-gray-400 hover:text-white'}`}
          >
            <FilterButton className="w-5 h-5" color="currentColor" isActive={isFilterActive} />
          </button>

          {/* Filter Dropdown */}
          <FilterDropdown
            isOpen={isFilterActive}
            onClose={() => setIsFilterActive(false)}
            anchorRef={filterButtonRef}
          />

          {/* Sort Toggle - Wrapped in LayoutGroup to isolate animations */}
          <LayoutGroup id="playlist-sort">
            <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate">
              <button
                onClick={() => setSortOrder('asc')}
                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortOrder === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {sortOrder === 'asc' && (
                  <motion.div
                    layoutId="playlistSortIndicator"
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
                    layoutId="playlistSortIndicator"
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

      {/* Playlist Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner className="w-10 h-10 text-[white]" />
        </div>
      ) : (
        <PlaylistGrid playlists={sortedPlaylists} onDelete={loadPlaylists} />
      )}

      {/* Only Library shows "Add new" */}
      {isLibrary && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1a1a1a] text-[#BAFFB5] text-sm font-medium rounded-full px-12 py-4 shadow-lg hover:bg-[#252525] transition"
          >
            Create Playlist
          </button>
        </div>
      )
      }

      {
        showCreateModal && (
          <CreatePlaylistModal
            onClose={() => setShowCreateModal(false)}
            onCreated={loadPlaylists}
          />
        )
      }

    </div >
  );
};

export default PlaylistDashboard;