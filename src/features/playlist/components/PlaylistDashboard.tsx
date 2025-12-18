import React, { useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import PlaylistGrid from './PlaylistGrid';
import AscendingButton from '../../../components/ui/AscendingButton';
import DescendingButton from '../../../components/ui/DescendingButton';
import FilterButton from '../../../components/ui/FilterButton';
import SearchField from '../../../components/ui/SearchField';
import FilterDropdown, { type FilterState, type SortOptionType } from '../../../components/ui/FilterDropdown';
import { getEnhancedPlaylists, getPlaylistStats, getLatestTime, type EnhancedPlaylist } from '../services/playlist_services';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { supabase } from '../../../lib/supabaseClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';


interface PlaylistDashboardProps {
  source: "library" | "favourites";
}

const PlaylistDashboard: React.FC<PlaylistDashboardProps> = ({ source }) => {
  const isLibrary = source === "library";

  const [activeSort, setActiveSort] = useState<SortOptionType>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [filterState, setFilterState] = useState<FilterState>({
    ratingMode: 'global',
    minRating: 0,
    tagMode: 'global',
    selectedTags: [],
    onlyFavorites: false
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, setPlaylists] = useState<EnhancedPlaylist[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filterButtonRef = useRef<HTMLDivElement>(null);

  /* already moved to services/playlist_services.ts
  const getLatestTime = (item: { created_at: string; updated_at?: string | null }) => {
      const created = new Date(item.created_at).getTime();
      const updated = item.updated_at ? new Date(item.updated_at).getTime() : 0;
      return updated > created ? item.updated_at! : item.created_at;
  };
  */

  // --- 1. Initial Load (Bulk) ---
  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 依然使用 Service 加载数据，保持架构整洁
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'playlists' }, () => loadData())
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
    };
  }, [source]);

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

  const hasActiveFilters = filterState.onlyFavorites || filterState.minRating > 0 || filterState.selectedTags.length > 0;

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
          case 'commented_at': valA = new Date(a.commented_at || 0).getTime(); valB = new Date(b.commented_at || 0).getTime(); break;
          case 'global_rating_avg': valA = a.rating_avg || 0; valB = b.rating_avg || 0; break;
          case 'global_rating_count': valA = a.rating_count || 0; valB = b.rating_count || 0; break;
          case 'global_rated_at': valA = new Date(a.rated_at || 0).getTime(); valB = new Date(b.rated_at || 0).getTime(); break;
          case 'global_tag_count': valA = a.tag_count || 0; valB = b.tag_count || 0; break;
          case 'global_tagged_at': valA = new Date(a.tagged_at || 0).getTime(); valB = new Date(b.tagged_at || 0).getTime(); break;
          case 'personal_rating': valA = a.user_rating || 0; valB = b.user_rating || 0; break;
          case 'personal_rated_at': valA = new Date(a.user_rated_at || 0).getTime(); valB = new Date(b.user_rated_at || 0).getTime(); break;
          case 'personal_tag_count': valA = a.user_tag_count || 0; valB = b.user_tag_count || 0; break;
          case 'personal_tagged_at': valA = new Date(a.user_tagged_at || 0).getTime(); valB = new Date(b.user_tagged_at || 0).getTime(); break;
          default: return 0;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    return processed;
  };

  const displayedPlaylists = processPlaylists();

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

          <FilterDropdown isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} anchorRef={filterButtonRef as React.RefObject<HTMLElement>} currentFilter={filterState} currentSort={activeSort} onFilterChange={setFilterState} onSortChange={setActiveSort} onClearAll={() => { setFilterState({ minRating: 0, tagMode: 'global', ratingMode: 'global', selectedTags: [], onlyFavorites: false }); setActiveSort('created_at'); setSortDirection('desc'); }} />

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
        <PlaylistGrid playlists={displayedPlaylists} onDelete={loadData} onReorder={handlePlaylistReorder} favoriteIds={favoriteIds} onToggleFavorite={handleFavoriteToggle} onPlaylistUpdate={handlePlaylistUpdate} />
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