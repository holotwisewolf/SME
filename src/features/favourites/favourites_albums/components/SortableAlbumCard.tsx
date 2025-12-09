import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AlbumCard from './AlbumCard';

interface SortableAlbumCardProps {
    albumId: string;
    onRemove: () => void;
}

export const SortableAlbumCard: React.FC<SortableAlbumCardProps> = ({
    albumId,
    onRemove
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: albumId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <AlbumCard
                albumId={albumId}
                onRemove={onRemove}
            />
        </div>
    );
};
