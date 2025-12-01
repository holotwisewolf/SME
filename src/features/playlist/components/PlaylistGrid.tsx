import React, { useState } from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { addTrackToPlaylist } from '../services/playlist_services';

interface PlaylistGridProps {
    playlists: Tables<'playlists'>[];
    onDelete?: () => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete }) => {
    const [activeTrack, setActiveTrack] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveTrack(active.data.current?.track);
        console.log("Drag Start:", active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTrack(null);

        if (!over) {
            console.log("Dropped over nothing");
            return;
        }

        const sourceId = active.id as string;
        const targetPlaylistId = over.id as string;

        console.log("Drag End:", { sourceId, targetPlaylistId });

        const [originPlaylistId, trackId] = sourceId.split('::');

        // Don't do anything if dropped on the same playlist
        if (originPlaylistId === targetPlaylistId) {
            console.log("Dropped on same playlist");
            return;
        }

        try {
            console.log(`Adding track ${trackId} from ${originPlaylistId} to ${targetPlaylistId}`);
            await addTrackToPlaylist({ playlistId: targetPlaylistId, trackId });
            // Optional: Show success toast or trigger refresh
        } catch (error) {
            console.error('Error moving track:', error);
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                {playlists.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                        <p className="text-xl font-medium mb-2">Oops, quite empty in here</p>
                        <p className="text-sm text-gray-500">Create a playlist to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-8">
                        {playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DragOverlay>
                {activeTrack ? (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#282828] shadow-xl border border-white/10 w-64 cursor-grabbing">
                        <div className="w-10 h-10 rounded overflow-hidden bg-[#1a1a1a] shrink-0">
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
                            <div className="text-sm text-white font-medium truncate">{activeTrack.name}</div>
                            <div className="text-xs text-gray-400 truncate">{activeTrack.artists?.[0]?.name}</div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default PlaylistGrid;