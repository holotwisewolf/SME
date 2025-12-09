import React, { useState } from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '../services/playlist_services';
import { Trash2 } from 'lucide-react';
import { SortablePlaylistCard } from './SortablePlaylistCard';

interface PlaylistGridProps {
    playlists: Tables<'playlists'>[];
    onDelete?: () => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete }) => {
    const [activeTrack, setActiveTrack] = useState<any>(null);
    const [activePlaylist, setActivePlaylist] = useState<Tables<'playlists'> | null>(null);
    const [isOverDroppable, setIsOverDroppable] = useState(false);
    const [playlistUpdates, setPlaylistUpdates] = useState<Record<string, number>>({});
    const [sortedPlaylists, setSortedPlaylists] = useState<Tables<'playlists'>[]>(playlists);

    // Update sorted playlists when props change
    React.useEffect(() => {
        setSortedPlaylists(playlists);
    }, [playlists]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = active.id as string;

        // Check if dragging a track (contains '::')
        if (activeId.includes('::')) {
            setActiveTrack(active.data.current?.track);
            setIsOverDroppable(true);
            console.log("Drag Start (Track):", activeId);
        } else {
            // Dragging a playlist card
            const playlist = sortedPlaylists.find(p => p.id === activeId);
            setActivePlaylist(playlist || null);
            console.log("Drag Start (Playlist):", activeId);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        setIsOverDroppable(!!event.over);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;

        // Handle track drag-and-drop
        if (activeId.includes('::')) {
            setActiveTrack(null);
            setIsOverDroppable(false);

            const [originPlaylistId, trackId] = activeId.split('::');

            if (!over) {
                console.log("Dropped over nothing - attempting deletion", { originPlaylistId, trackId });
                try {
                    await removeTrackFromPlaylist(originPlaylistId, trackId);
                    setPlaylistUpdates(prev => ({
                        ...prev,
                        [originPlaylistId]: Date.now()
                    }));
                    console.log("Track removed successfully via drag-to-delete");
                } catch (error) {
                    console.error("Error removing track in Grid View:", error);
                }
                return;
            }

            const targetPlaylistId = over.id as string;

            console.log("Drag End (Track):", { activeId, targetPlaylistId });

            if (originPlaylistId === targetPlaylistId) {
                console.log("Dropped on same playlist");
                return;
            }

            try {
                console.log(`Adding track ${trackId} from ${originPlaylistId} to ${targetPlaylistId}`);
                await addTrackToPlaylist({ playlistId: targetPlaylistId, trackId });

                setPlaylistUpdates(prev => ({
                    ...prev,
                    [targetPlaylistId]: Date.now()
                }));
            } catch (error) {
                console.error('Error moving track:', error);
            }
        } else {
            // Handle playlist card reordering
            setActivePlaylist(null);

            if (over && active.id !== over.id) {
                const oldIndex = sortedPlaylists.findIndex(p => p.id === active.id);
                const newIndex = sortedPlaylists.findIndex(p => p.id === over.id);

                const newOrder = arrayMove(sortedPlaylists, oldIndex, newIndex);
                setSortedPlaylists(newOrder);
                console.log("Playlist reordered:", { from: oldIndex, to: newIndex });
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
        >
            <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                {sortedPlaylists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                        <p className="text-xl font-medium mb-2">Oops, quite empty in here</p>
                        <p className="text-sm text-gray-500">Create a playlist to get started</p>
                    </div>
                ) : (
                    <SortableContext items={sortedPlaylists.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 gap-8 items-start">
                            {sortedPlaylists.map((playlist) => (
                                <SortablePlaylistCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    onDelete={onDelete}
                                    lastUpdated={playlistUpdates[playlist.id]}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </div>

            <DragOverlay>
                {activeTrack ? (
                    <div className={`flex items-center gap-3 p-2 rounded-lg shadow-xl border w-64 cursor-grabbing transition-colors duration-200 ${!isOverDroppable ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500' : 'bg-[#282828] border-white/10'}`}>
                        <div className="w-10 h-10 rounded overflow-hidden bg-[#1a1a1a] shrink-0 relative">
                            {!isOverDroppable && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 transition-opacity">
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                            {activeTrack.album?.images?.[0]?.url ? (
                                <img src={activeTrack.album.images[0].url} alt={activeTrack.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${!isOverDroppable ? 'text-red-200' : 'text-white'}`}>
                                {!isOverDroppable ? 'Release to Delete' : activeTrack.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{activeTrack.artists?.[0]?.name}</div>
                        </div>
                    </div>
                ) : activePlaylist ? (
                    <div className="opacity-60 cursor-grabbing">
                        <PlaylistCard
                            playlist={activePlaylist}
                            onDelete={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default PlaylistGrid;