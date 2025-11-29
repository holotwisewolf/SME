import React, { useState, useEffect } from 'react';
import type { Playlist } from '../../spotify/contracts/playlist_contract';
import FavButton from '../../../components/ui/FavButton';
import TrashButton from '../../../components/ui/TrashButton'
import ExpandButton from '../../../components/ui/ExpandButton';
import { deletePlaylist } from '../../spotify/services/playlist_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onDelete }) => {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    checkIsFavourite(playlist.id, 'playlist').then(setIsFavourite);
  }, [playlist.id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
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
        <h3 className="font-medium text-[#E0E0E0] text-lg line-clamp-2 leading-tight">{playlist.name}</h3>
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
        <div className="bg-[#292929] rounded-2xl h-32 w-full">
          {playlist.image_url && (
            <img src={playlist.image_url} alt={playlist.name} className="w-full h-full object-cover rounded-2xl" />
          )}
        </div>

        {/* If you have tracks, map them here, otherwise show the placeholder above */}
        <div className="text-xs text-gray-500 px-1">
          {playlist.track_count} tracks
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
