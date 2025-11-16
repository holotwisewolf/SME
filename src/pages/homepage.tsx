// src/pages/homepage.tsx
import React from 'react';
import PlaylistGrid from '../components/PlaylistGrid';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#FFD1D1]">Playlist</h1>
        <div className="flex items-center space-x-2">
          <button className="bg-[#292929] px-4 py-2 rounded-md text-[#D1D1D1]">Name</button>
          <button className="bg-transparent px-4 py-2 rounded-md text-[#D1D1D1]">Date</button>
        </div>
      </div>
      
      <PlaylistGrid />

      <div className="flex justify-end mt-6">
        <button className="bg-[#292929] text-[#BAFFB5] font-bold rounded-full px-6 py-3 text-lg">
          Add Playlist
        </button>
      </div>
    </div>
  );
};

export default HomePage;