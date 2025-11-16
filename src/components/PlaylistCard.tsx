// src/components/PlaylistCard.tsx
import React from 'react';
import TrackItem from './TrackItem';

interface Track {
  trackId: string;
  draggable: boolean;
  state?: string;
}

interface PlaylistCardProps {
  playlistName: string;
  tracks: Track[];
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlistName, tracks }) => {
  return (
    <div className="bg-[#292929]/60 p-4 rounded-md flex flex-col space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[#D1D1D1]">{playlistName}</h3>
        <div className="flex space-x-2">
          <button className="text-lg">❤️</button>
          <button className="text-lg">🗑️</button>
        </div>
      </div>
      <div className="space-y-2">
        {tracks.map((track) => (
          <TrackItem key={track.trackId} {...track} />
        ))}
      </div>
      <button className="bg-[#BAFFB5] text-[#292929] font-bold rounded-md py-2 w-full mt-2">
        Add Track
      </button>
    </div>
  );
};

export default PlaylistCard;
