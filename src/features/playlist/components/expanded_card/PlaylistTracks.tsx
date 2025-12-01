import React from 'react';
import { SpotifyService } from '../../../spotify/services/spotify_services';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MoveOrderIcon from '../../../../components/ui/MoveOrderIcon';

interface PlaylistTracksProps {
    tracks: any[];
    isEditingEnabled: boolean;
    onRemoveTrack: (trackId: string) => void;
    onReorderTracks: (newOrder: any[]) => void;
}

interface SortableTrackItemProps {
    item: any;
    index: number;
    isEditingEnabled: boolean;
    onRemoveTrack: (trackId: string) => void;
}

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({ item, index, isEditingEnabled, onRemoveTrack }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id, disabled: !isEditingEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group transition-colors">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {isEditingEnabled ? (
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded">
                        <MoveOrderIcon className="w-5 h-5 text-gray-400" />
                    </div>
                ) : (
                    <span className="text-gray-500 w-6 text-center text-sm">{index + 1}</span>
                )}

                <div className="w-10 h-10 bg-[#2a2a2a] rounded flex-shrink-0 overflow-hidden">
                    {item.details?.album?.images?.[0]?.url && (
                        <img src={item.details.album.images[0].url} alt="Album" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-medium truncate">{item.details?.name || 'Unknown Track'}</span>
                    <span className="text-gray-400 text-xs truncate">{item.details?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-gray-500 text-xs font-mono">
                    {item.details ? SpotifyService.formatDuration(item.details.duration_ms) : '--:--'}
                </span>

                {isEditingEnabled && (
                    <button
                        onClick={() => onRemoveTrack(item.spotify_track_id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Remove from playlist"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export const PlaylistTracks: React.FC<PlaylistTracksProps> = ({ tracks, isEditingEnabled, onRemoveTrack, onReorderTracks }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tracks.findIndex((track) => track.id === active.id);
            const newIndex = tracks.findIndex((track) => track.id === over.id);

            const newOrder = arrayMove(tracks, oldIndex, newIndex);
            onReorderTracks(newOrder);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between text-gray-400 text-sm border-b border-white/5 pb-2 mb-2 flex-shrink-0">
                <span className="pl-2"># Title</span>
                <span className="pr-12">Duration {isEditingEnabled && ' / Actions'}</span>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-1">
                {tracks.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tracks.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {tracks.map((item, index) => (
                                <SortableTrackItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isEditingEnabled={isEditingEnabled}
                                    onRemoveTrack={onRemoveTrack}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>No tracks in this playlist yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
