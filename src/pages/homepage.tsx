import React from 'react';
import PlaylistGrid from '../components/PlaylistGrid';
import Clock from '../components/Clock';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col h-full px-2 relative">
      {/* Top Row */}
      <div className="flex justify-between items-center mb-8 pt-2">
        
        {/* Left Group: Title + Toggle */}
        <div className="flex items-center gap-6">
          
          {/* Playlist Title: text-4xl (approx 40px height) */}
          <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
            Playlist
          </h1>
          
          {/* Toggle Switch 
              - h-10 (40px) matches the height of text-4xl 
              - flex items-center ensures buttons are centered inside
          */}
          <div className="bg-[#292929] rounded-full p-1 flex items-center h-10">
            <button className="bg-[#1a1a1a] text-white px-5 h-full rounded-full text-sm font-medium flex items-center">
              Name
            </button>
            <button className="text-gray-400 px-5 h-full rounded-full text-sm font-medium hover:text-white flex items-center">
              Name
            </button>
          </div>
        </div>

        {/* Clock */}
        <Clock />
      </div>
      
      <PlaylistGrid />

      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-[#1a1a1a] text-[#BAFFB5] text-sm font-medium rounded-full px-12 py-4 shadow-lg hover:bg-[#252525] transition">
          Add new
        </button>
      </div>
    </div>
  );
};

export default HomePage;