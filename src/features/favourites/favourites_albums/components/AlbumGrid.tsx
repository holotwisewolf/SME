import React from 'react';
import AlbumCard from './AlbumCard';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableAlbumCard } from './SortableAlbumCard';
import { useAlbumGrid } from '../hooks/useAlbumGrid';

interface AlbumGridProps {
    albums: string[]; // Array of album IDs
    onDelete?: () => void;
    searchQuery?: string;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onDelete, searchQuery = '' }) => {
    const {
        activeAlbum,
        visibleAlbums,
        sensors,
        handleRemove,
        handleDragStart,
        handleDragEnd
    } = useAlbumGrid({ albums, onDelete });

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
                                    searchQuery={searchQuery}
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
