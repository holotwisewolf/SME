import React, { useState } from 'react';
import AlbumCard from './AlbumCard';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableAlbumCard } from './SortableAlbumCard';

interface AlbumGridProps {
    albums: string[]; // Array of album IDs
    onDelete?: () => void;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onDelete }) => {
    const [removedAlbums, setRemovedAlbums] = useState<Set<string>>(new Set());
    const [sortedAlbums, setSortedAlbums] = useState<string[]>(albums);
    const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

    // Update sorted albums when props change
    React.useEffect(() => {
        setSortedAlbums(albums);
    }, [albums]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleRemove = (albumId: string) => {
        setRemovedAlbums(prev => new Set([...prev, albumId]));
        onDelete?.();
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveAlbum(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveAlbum(null);

        if (over && active.id !== over.id) {
            const oldIndex = sortedAlbums.indexOf(active.id as string);
            const newIndex = sortedAlbums.indexOf(over.id as string);

            const newOrder = arrayMove(sortedAlbums, oldIndex, newIndex);
            setSortedAlbums(newOrder);
        }
    };

    const visibleAlbums = sortedAlbums.filter(id => !removedAlbums.has(id));

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
        >
            <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                {visibleAlbums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                        <p className="text-xl font-medium mb-2">No albums in your library yet</p>
                        <p className="text-sm text-gray-500">Add albums to your favorites to see them here</p>
                    </div>
                ) : (
                    <SortableContext items={visibleAlbums} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 gap-8 items-start">
                            {visibleAlbums.map((albumId) => (
                                <SortableAlbumCard
                                    key={albumId}
                                    albumId={albumId}
                                    onRemove={() => handleRemove(albumId)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </div>

            <DragOverlay>
                {activeAlbum ? (
                    <div className="opacity-60 cursor-grabbing">
                        <AlbumCard
                            albumId={activeAlbum}
                            onRemove={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default AlbumGrid;
