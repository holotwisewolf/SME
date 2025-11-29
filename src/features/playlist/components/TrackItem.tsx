// src/components/TrackItem.tsx
// src/components/TrackItem.tsx
import React from 'react';

interface TrackItemProps {
  trackId: string;
  draggable: boolean;
  state?: string;
}

const TrackItem: React.FC<TrackItemProps> = ({ state }) => {
  const isDragging = state === 'dragging';
  return (
    <div
      className={`p-2 rounded-md text-sm ${isDragging ? 'bg-[#292929] text-black' : 'bg-[#292929]'
        }`}>
      Track Item
    </div>
  );
};

export default TrackItem;
