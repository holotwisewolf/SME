import React from 'react';
import FavButton from './FavButton'; 
import TrashButton from './TrashButton'
import ExpandButton from './ExpandButton';

interface Track {
  trackId: string;
  draggable: boolean;
  state?: string;
}

interface PlaylistCardProps {
  playlistName: string;
  tracks: Track[];
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlistName }) => {
  // In the design, the cards seem to have empty placeholders rather than list items
  // I'll mock 3 empty slots like the image
  const emptySlots = [1, 2, 3];

  return (
    <div className="bg-[#292929]/60 p-4 rounded-xl flex flex-col h-80 shadow-md relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 px-1">
        <h3 className="font-medium text-[#E0E0E0] text-lg">{playlistName}</h3>
        <div className="flex space-x-3 text-[#FFD1D1]">
          <FavButton/>
          <TrashButton/>
          <ExpandButton/>
        </div>
      </div>

      {/* Content Area - Darker Placeholders */}
      <div className="space-y-3 flex-1">
        {/* The image shows a large dark rectangle placeholder or multiple small ones */}
        {/* Option A: One large placeholder like 'Chill Vibes' / 'Workout Hits' */}
        <div className="bg-[#292929] rounded-2xl h-32 w-full"></div>
        
        {/* If you have tracks, map them here, otherwise show the placeholder above */}
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