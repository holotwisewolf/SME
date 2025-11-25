import React from 'react';
import PlaylistGrid from '../components/PlaylistGrid';
import Clock from '../../../components/ui/Clock';

interface PlaylistDashboardProps {
  source: "library" | "favourites";
}

const PlaylistDashboard: React.FC<PlaylistDashboardProps> = ({ source }) => {
  const isLibrary = source === "library";

  return (
    <div className="flex flex-col h-full px-6 relative pb-32">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pt-2 mt-6">
        <div className="flex items-center gap-6">

          <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
            {isLibrary ? "Your Playlists" : "Your Favourites"}
          </h1>

          {/* Sorting Toggle (same for both) */}
          <div className="bg-[#292929] rounded-full p-1 flex items-center h-10">
            <button className="bg-[#1a1a1a] text-white px-5 h-full rounded-full text-sm font-medium">
              Ascending
            </button>
            <button className="text-gray-400 px-5 h-full rounded-full text-sm font-medium hover:text-white">
              Descending
            </button>
          </div>

        </div>

        <Clock />
      </div>

      {/* Playlist Grid */}
      <PlaylistGrid source={source} />

      {/* Only Library shows "Add new" */}
      {isLibrary && (
        <div className="absolute bottom-8 right-8 z-50">
          <button className="bg-[#1a1a1a] text-[#BAFFB5] text-sm font-medium rounded-full px-12 py-4 shadow-lg hover:bg-[#252525] transition">
            Add new
          </button>
        </div>
      )}

    </div>
  );
};

export default PlaylistDashboard;
