import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';

interface SortablePlaylistCardProps {
    playlist: Tables<'playlists'>;
    onDelete?: () => void;
    lastUpdated?: number;
}

export const SortablePlaylistCard: React.FC<SortablePlaylistCardProps> = ({
    playlist,
    onDelete,
    lastUpdated
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: playlist.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <PlaylistCard
                playlist={playlist}
                onDelete={onDelete}
                lastUpdated={lastUpdated}
            />
        </div>
    );
};
