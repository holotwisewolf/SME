import { useState, useEffect } from 'react';
import type { Tables } from '../../../types/supabase';
import type { EnhancedPlaylist } from '../services/playlist_services';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '../services/playlist_services';

interface UsePlaylistGridProps {
    playlists: EnhancedPlaylist[];
    onReorder?: (newOrder: EnhancedPlaylist[]) => void;
}

export const usePlaylistGrid = ({ playlists, onReorder }: UsePlaylistGridProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [activeTrack, setActiveTrack] = useState<any>(null);
    const [activePlaylist, setActivePlaylist] = useState<Tables<'playlists'> | null>(null);
    const [isOverDroppable, setIsOverDroppable] = useState(false);
    const [playlistUpdates, setPlaylistUpdates] = useState<Record<string, number>>({});
    const [sortedPlaylists, setSortedPlaylists] = useState<EnhancedPlaylist[]>(playlists);

    useEffect(() => { setSortedPlaylists(playlists); }, [playlists]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = active.id as string;
        if (activeId.includes('::')) {
            setActiveTrack(active.data.current?.track);
            setIsOverDroppable(true);
        } else {
            const playlist = sortedPlaylists.find(p => p.id === activeId);
            setActivePlaylist(playlist || null);
        }
    };

    const handleDragOver = (event: DragOverEvent) => { setIsOverDroppable(!!event.over); };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;

        if (activeId.includes('::')) {
            setActiveTrack(null);
            setIsOverDroppable(false);
            const [originPlaylistId, trackId] = activeId.split('::');
            if (!over) {
                try {
                    await removeTrackFromPlaylist(originPlaylistId, trackId);
                    setPlaylistUpdates(prev => ({ ...prev, [originPlaylistId]: Date.now() }));
                    showSuccess('Track removed from playlist');
                } catch (error) {
                    console.error(error);
                    showError('Failed to remove track');
                }
                return;
            }
            let targetPlaylistId = over.id as string;
            // If dropped onto a track (composite ID), extract the playlist ID
            if (targetPlaylistId.includes('::')) {
                targetPlaylistId = targetPlaylistId.split('::')[0];
            }

            if (originPlaylistId === targetPlaylistId) return;
            try {
                await addTrackToPlaylist({ playlistId: targetPlaylistId, trackId });
                setPlaylistUpdates(prev => ({ ...prev, [targetPlaylistId]: Date.now() }));
                showSuccess('Track added to playlist');
            } catch (error: any) {
                console.error(error);
                if (error.message?.includes('already in playlist')) {
                    showError('Track already in playlist');
                } else {
                    showError('Failed to add track');
                }
            }
        } else {
            setActivePlaylist(null);
            if (over && active.id !== over.id) {
                const oldIndex = sortedPlaylists.findIndex(p => p.id === active.id);
                const newIndex = sortedPlaylists.findIndex(p => p.id === over.id);
                const newOrder = arrayMove(sortedPlaylists, oldIndex, newIndex);
                setSortedPlaylists(newOrder);
                if (onReorder) onReorder(newOrder);
            }
        }
    };

    return {
        activeTrack,
        activePlaylist,
        isOverDroppable,
        playlistUpdates,
        sortedPlaylists,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    };
};
