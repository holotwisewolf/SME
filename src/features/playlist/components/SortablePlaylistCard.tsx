import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';
import type { EnhancedPlaylist } from './PlaylistDashboard'; 

interface SortablePlaylistCardProps {
    playlist: Tables<'playlists'>;
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