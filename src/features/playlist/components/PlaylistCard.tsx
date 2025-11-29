import React, { useState, useEffect } from 'react';
import type { Tables } from '../../../types/supabase';
import FavButton from '../../../components/ui/FavButton';
import TrashButton from '../../../components/ui/TrashButton'
import ExpandButton from '../../../components/ui/ExpandButton';
import { deletePlaylist } from '../../spotify/services/playlist_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';

interface PlaylistCardProps {
  playlist: Tables<'playlists'>;
  onDelete?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onDelete }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    checkIsFavourite(playlist.id, 'playlist').then(setIsFavourite);
  }, [playlist.id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      try {
        await deletePlaylist(playlist.id);
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Failed to delete playlist');
      }
    }
  };

  const handleFavourite = async () => {
    // 1. Get the target state
    const willBeFavourite = !isFavourite;

    // 2. Optimistic Update
    setIsFavourite(willBeFavourite);

    try {
      if (!willBeFavourite) {
        // Target is NOT a favorite -> REMOVE
        await removeFromFavourites(playlist.id, "playlist");
      } else {
        // Target IS a favorite -> ADD
        await addToFavourites(playlist.id, "playlist");
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);

      // 3. Revert state on error (revert to the *original* state)
      setIsFavourite(!willBeFavourite);

      // Optional: Show error to user
      alert('Failed to update favorite status.');
    }
  };

  return (
    <div className="bg-[#292929]/60 p-4 rounded-xl flex flex-col h-80 shadow-md relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 px-1">
        <h3 className="font-medium text-[#E0E0E0] text-lg line-clamp-2 leading-tight">{playlist.title}</h3>
        <div className="flex space-x-3 text-[#FFD1D1]">
          <div className="cursor-pointer">
            <FavButton
              isFavourite={isFavourite}
              onClick={(e) => {
                e.stopPropagation();
                handleFavourite();
              }}
            />
          </div>
          <div onClick={handleDelete} className="cursor-pointer">
            <TrashButton />
          </div>
          <ExpandButton />
        </div>
      </div>

      {/* Content Area - Darker Placeholders */}
      <div className="space-y-3 flex-1">
        {/* The image shows a large dark rectangle placeholder or multiple small ones */}
        {/* Option A: One large placeholder like 'Chill Vibes' / 'Workout Hits' */}
        <div className="bg-[#292929] rounded-2xl h-32 w-full overflow-hidden relative">
          {/* Since we don't have image_url in DB yet, we can use color or placeholder */}
          {playlist.color ? (
            <div className="w-full h-full" style={{ backgroundColor: playlist.color }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
        </div>

        {/* If you have tracks, map them here, otherwise show the placeholder above */}
        <div className="text-xs text-gray-500 px-1">
          {playlist.track_count || 0} tracks
        </div>
      </div>

      {/* Footer - "Add new" text */}
      <div className="mt-auto pt-4 flex justify-center">
        <button className="text-[#D1D1D1] text-sm font-medium hover:text-white transition">
          Add new
        </button>
      </div>
    </div>
  );
};

export default PlaylistCard;
