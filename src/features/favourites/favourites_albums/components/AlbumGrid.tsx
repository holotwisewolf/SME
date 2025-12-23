import React from 'react';
import AlbumCard from './AlbumCard';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableAlbumCard } from './SortableAlbumCard';
import { useAlbumGrid } from '../hooks/useAlbumGrid';

interface AlbumGridProps {
    albums: string[] | any[]; // Accept IDs or EnhancedAlbum objects
    onDelete?: () => void;
    onUpdate?: () => void;
    searchQuery?: string;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onDelete, onUpdate, searchQuery = '' }) => {
    // If albums are objects, extract IDs for useAlbumGrid, but keep objects for rendering
    const albumIds = React.useMemo(() => albums.map(a => typeof a === 'string' ? a : a.id), [albums]);

    // Create a map for quick lookup of data if provided
    const albumDataMap = React.useMemo(() => new Map(
        albums
            .filter(a => typeof a !== 'string')
            .map(a => [a.id, a])
    ), [albums]);

    const {
        activeAlbum,
        visibleAlbums, // This returns IDs since useAlbumGrid works with IDs
        sensors,
        handleRemove,
        handleDragStart,
        handleDragEnd
    } = useAlbumGrid({ albums: albumIds, onDelete });

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
                                    // Use specific onUpdate prop if available, or fall back to onDelete (which is loadAlbums in parent)
                                    onUpdate={onUpdate || onDelete}
                                    searchQuery={searchQuery}
                                    initialData={albumDataMap.get(albumId)}
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
