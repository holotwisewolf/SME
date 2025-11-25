// src/components/PlaylistGrid.tsx
import React from 'react';
import PlaylistCard from './PlaylistCard';

const playlistGridData = [
  {
    playlistId: "p1",
    playlistName: "My Epic Mix",
    icons: { favorite: true, delete: true },
    tracks: [
      { trackId: "t1", draggable: true, state: "dragging" },
      { trackId: "t2", draggable: true },
      { trackId: "t3", draggable: true },
    ],
    actions: { addTrack: true },
  },
  {
    playlistId: "p2",
    playlistName: "Chill Vibes",
    icons: { favorite: true, delete: true },
    tracks: [],
    actions: { addTrack: true },
  },
  {
    playlistId: "p3",
    playlistName: "Workout Hits",
    icons: { favorite: true, delete: true },
    tracks: [],
    actions: { addTrack: true },
  },
];

interface PlaylistGridProps {
  source: "library" | "favourites";
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ source }) => {
  const filteredPlaylists = playlistGridData.filter(playlist => {
    if (source === 'favourites') {
      return playlist.icons.favorite;
    }
    return true; // Show all for library
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPlaylists.map((playlist) => (
        <PlaylistCard
          key={playlist.playlistId}
          playlistName={playlist.playlistName}
          tracks={playlist.tracks}
        />
      ))}
    </div>
  );
};

export default PlaylistGrid;
