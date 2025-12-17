import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DropAnimation,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlaylistTrackItem } from './PlaylistTrackItem';

interface PlaylistTracksProps {
    tracks: any[];
    isEditingEnabled: boolean;
    onRemoveTrack: (trackId: string) => void;
    onReorderTracks: (newOrder: any[]) => void;
    onTrackClick: (track: any) => void;
}

interface SortableTrackItemProps {
    item: any;
    index: number;
    isEditingEnabled: boolean;
    onRemoveTrack: (trackId: string) => void;
    onTrackClick: (track: any) => void;
}

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({ item, index, isEditingEnabled, onRemoveTrack, onTrackClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id, disabled: !isEditingEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Dim the original item while dragging
    };

    return (
        <div ref={setNodeRef} style={style}>
            <PlaylistTrackItem
                item={item}
                index={index}
                isEditingEnabled={isEditingEnabled}
                onRemoveTrack={onRemoveTrack}
                onTrackClick={onTrackClick}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
};

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.4',
            },
        },
    }),
};

export const PlaylistTracks: React.FC<PlaylistTracksProps> = ({ tracks, isEditingEnabled, onRemoveTrack, onReorderTracks, onTrackClick }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setOverId(event.active.id as string); // Initially over itself
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over?.id as string || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log('Drag End:', { activeId: active.id, overId: over?.id });

        if (over && active.id !== over.id) {
            const oldIndex = tracks.findIndex((track) => track.id === active.id);
            const newIndex = tracks.findIndex((track) => track.id === over.id);

            const newOrder = arrayMove(tracks, oldIndex, newIndex);
            onReorderTracks(newOrder);
        }

        setActiveId(null);
        setOverId(null);
    };

    const activeTrack = activeId ? tracks.find(t => t.id === activeId) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between text-gray-400 text-sm border-b border-white/5 pb-2 mb-2 flex-shrink-0">
                <span className="pl-2"># Title</span>
                <div className="w-[160px] flex justify-end pr-2 gap-3 items-center">
                    <span>Duration</span>
                    <div className="w-9" />
                </div>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-1">
                {tracks.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
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
                                    onTrackClick={onTrackClick}
                                />
                            ))}
                        </SortableContext>

                        {createPortal(
                            <DragOverlay dropAnimation={dropAnimationConfig}>
                                {activeTrack ? (
                                    <PlaylistTrackItem
                                        item={activeTrack}
                                        isEditingEnabled={isEditingEnabled}
                                        isOverlay={true}
                                    />
                                ) : null}
                            </DragOverlay>,
                            document.body
                        )}
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
