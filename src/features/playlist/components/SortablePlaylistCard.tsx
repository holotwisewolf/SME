import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlaylistCard from './PlaylistCard';
// [Fix] Import EnhancedPlaylist from services
import type { EnhancedPlaylist } from '../services/playlist_services';

interface SortablePlaylistCardProps {
    // [Fix] Use EnhancedPlaylist type to match parent data
    playlist: EnhancedPlaylist;
    onDelete?: () => void;
    lastUpdated?: number;
    isLiked?: boolean;
    onToggleFavorite?: (id: string, isFav: boolean) => void;
    onPlaylistUpdate?: (id: string, updates: Partial<EnhancedPlaylist>) => void; 
}

export const SortablePlaylistCard: React.FC<SortablePlaylistCardProps> = ({
    playlist, onDelete, lastUpdated, isLiked, onToggleFavorite, onPlaylistUpdate 
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: playlist.id });

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
                initialIsLiked={isLiked}
                onToggleFavorite={onToggleFavorite}
                onPlaylistUpdate={onPlaylistUpdate} 
            />
        </div>
    );
};