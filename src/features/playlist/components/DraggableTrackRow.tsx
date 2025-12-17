import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableTrackRowProps {
    track: any;
    playlistId: string;
    children: React.ReactNode;
    className?: string;
}

export const DraggableTrackRow: React.FC<DraggableTrackRowProps> = ({ track, playlistId, children, className }) => {
    // Use useSortable instead of useDraggable to support reordering
    // id format: "playlistId::trackId" (same as before to match PlaylistGrid logic)
    // But for SortableContext in PlaylistCard, we need to pass these exact IDs
    const id = `${playlistId}::${track.spotify_track_id || track.id}`;
    // Wait, track object structure: in PlaylistCard previewTracks are from getMultipleTracks (Spotify objects),
    // they don't have 'playlist_item_id'.
    // `getPlaylistPreviewTracks` returns spotify track objects. 
    // They do NOT have the `playlist_item` id. 
    // `PlaylistGrid` logic uses `track.id` which is Spotify ID.
    // Logic: const [originPlaylistId, trackId] = activeId.split('::');
    // So ID must be `playlistId::spotifyId`.

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: `${playlistId}::${track.id}`,
        data: {
            track,
            originPlaylistId: playlistId,
            sortable: { containerId: playlistId } // Mark which container it belongs to
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

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
