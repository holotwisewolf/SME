import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrackCard } from './TrackCard';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';

interface SortableTrackCardProps {
    track: SpotifyTrack;
    isFavourite?: boolean;
    onToggleFavourite?: (e: React.MouseEvent) => void;
    onClick: () => void;
}

export const SortableTrackCard: React.FC<SortableTrackCardProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.track.id });

    const style = {
        // FIX: Use Translate instead of Transform to avoid scaling artifacts/distortions
        transform: CSS.Translate.toString(transform),
        transition,
        // Ensure the dragged item is above everything else if no overlay is used, 
        // or handled correctly if one is.
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as const,
        touchAction: 'none', // Essential for preventing scroll on mobile while dragging
        // FIX: Hide the original element in the list while dragging to prevent "duplication" 
        // (seeing both the list item and the drag overlay)
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TrackCard {...props} />
        </div>
    );
};