import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableTrackRowProps {
    track: any;
    playlistId: string;
    children: React.ReactNode;
    className?: string;
}

export const DraggableTrackRow: React.FC<DraggableTrackRowProps> = ({ track, playlistId, children, className }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${playlistId}::${track.id}`,
        data: {
            track,
            originPlaylistId: playlistId
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`${className || ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
            {children}
        </div>
    );
};
