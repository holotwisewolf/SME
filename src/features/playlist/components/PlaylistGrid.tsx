import React, { useState, useEffect } from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';
// [Fix] Import from services, NOT from PlaylistDashboard
import type { EnhancedPlaylist } from '../services/playlist_services';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, rectIntersection } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '../services/playlist_services';
import { SortablePlaylistCard } from './SortablePlaylistCard';
import { Trash2 } from 'lucide-react';

interface PlaylistGridProps {
    playlists: EnhancedPlaylist[];
    onDelete?: () => void;
    onReorder?: (newOrder: EnhancedPlaylist[]) => void;
    favoriteIds?: Set<string>;
    onToggleFavorite?: (id: string, isFav: boolean) => void;
    onPlaylistUpdate?: (id: string, updates: Partial<EnhancedPlaylist>) => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({
    playlists, onDelete, onReorder, favoriteIds, onToggleFavorite, onPlaylistUpdate
}) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [activeTrack, setActiveTrack] = useState<any>(null);
    const [activePlaylist, setActivePlaylist] = useState<Tables<'playlists'> | null>(null);
    const [isOverDroppable, setIsOverDroppable] = useState(false);
    const [playlistUpdates, setPlaylistUpdates] = useState<Record<string, number>>({});
    const [sortedPlaylists, setSortedPlaylists] = useState<EnhancedPlaylist[]>(playlists);

    useEffect(() => { setSortedPlaylists(playlists); }, [playlists]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} collisionDetection={rectIntersection}>
            <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                {sortedPlaylists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12"><p className="text-xl font-medium mb-2">Oops, quite empty in here</p><p className="text-sm text-gray-500">Create a playlist to get started</p></div>
                ) : (
                    <SortableContext items={sortedPlaylists.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 gap-8 items-start">
                            {sortedPlaylists.map((playlist) => (
                                <SortablePlaylistCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    onDelete={onDelete}
                                    lastUpdated={playlistUpdates[playlist.id]}
                                    isLiked={favoriteIds?.has(playlist.id)}
                                    onToggleFavorite={onToggleFavorite}
                                    onPlaylistUpdate={onPlaylistUpdate} // [Sync Fix] Pass prop
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </div>
            <DragOverlay>
                {activeTrack ? (
                    <div className={`flex items-center gap-3 p-2 rounded-lg shadow-xl border w-64 cursor-grabbing transition-colors duration-200 ${!isOverDroppable ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500' : 'bg-[#282828] border-white/10'}`}>
                        <div className="w-10 h-10 rounded overflow-hidden bg-[#1a1a1a] shrink-0 relative flex items-center justify-center">
                            {!isOverDroppable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><Trash2 className="w-5 h-5 text-red-500" /></div>}
                            <div className="w-full h-full flex items-center justify-center text-gray-500">♪</div>
                        </div>
                        <div className="flex-1 min-w-0"><div className={`text-sm font-medium truncate ${!isOverDroppable ? 'text-white font-bold' : 'text-white'}`}>{!isOverDroppable ? 'Remove' : activeTrack.name}</div></div>
                    </div>
                ) : activePlaylist ? (
                    <div className="opacity-60 cursor-grabbing"><PlaylistCard playlist={activePlaylist} onDelete={() => { }} /></div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default PlaylistGrid;