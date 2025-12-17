import React, { useState, useEffect } from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';
import type { EnhancedPlaylist } from './PlaylistDashboard'; // [Sync Fix]
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '../services/playlist_services';
import { SortablePlaylistCard } from './SortablePlaylistCard';

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
                } catch (error) { console.error(error); }
                return;
            }
            const targetPlaylistId = over.id as string;
            if (originPlaylistId === targetPlaylistId) return;
            try {
                await addTrackToPlaylist({ playlistId: targetPlaylistId, trackId });
                setPlaylistUpdates(prev => ({ ...prev, [targetPlaylistId]: Date.now() }));
            } catch (error) { console.error(error); }
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

    const TrashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
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
                            {!isOverDroppable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><TrashIcon /></div>}
                            <div className="w-full h-full flex items-center justify-center text-gray-500">♪</div>
                        </div>
                        <div className="flex-1 min-w-0"><div className={`text-sm font-medium truncate ${!isOverDroppable ? 'text-red-200' : 'text-white'}`}>{!isOverDroppable ? 'Release to Delete' : activeTrack.name}</div></div>
                    </div>
                ) : activePlaylist ? (
                    <div className="opacity-60 cursor-grabbing"><PlaylistCard playlist={activePlaylist} onDelete={() => { }} /></div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default PlaylistGrid;