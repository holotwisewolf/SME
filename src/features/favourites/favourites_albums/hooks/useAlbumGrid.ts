import { useState, useEffect } from 'react';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface UseAlbumGridProps {
    albums: string[];
    onDelete?: () => void;
}

export const useAlbumGrid = ({ albums, onDelete }: UseAlbumGridProps) => {
    const [removedAlbums, setRemovedAlbums] = useState<Set<string>>(new Set());
    const [sortedAlbums, setSortedAlbums] = useState<string[]>(albums);
    const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

    // Update sorted albums when props change
    useEffect(() => {
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

    return {
        activeAlbum,
        visibleAlbums,
        sensors,
        handleRemove,
        handleDragStart,
        handleDragEnd
    };
};
