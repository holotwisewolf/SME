import React from 'react';
import PlaylistCard from './PlaylistCard';
// [Fix] Import from services, NOT from PlaylistDashboard
import type { EnhancedPlaylist } from '../services/playlist_services';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, rectIntersection } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePlaylistCard } from './SortablePlaylistCard';
import { Trash2 } from 'lucide-react';
import { usePlaylistGrid } from '../hooks/usePlaylistGrid';

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
    const {
        activeTrack,
        activePlaylist,
        isOverDroppable,
        playlistUpdates,
        sortedPlaylists,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    } = usePlaylistGrid({ playlists, onReorder });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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