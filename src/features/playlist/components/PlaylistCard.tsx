import React from 'react';
import type { Tables } from '../../../types/supabase';
import FavButton from '../../../components/ui/FavButton';
import ExpandButton from '../../../components/ui/ExpandButton';
import CollapseVerticalButton from '../../../components/ui/CollapseVerticalButton';
import { AddTrackModal } from './AddTrackModal';
import { ExpandedPlaylistCard } from './expanded_card/ExpandedPlaylistCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableTrackRow } from './DraggableTrackRow';
import type { EnhancedPlaylist } from '../services/playlist_services';
import { usePlaylistCard } from '../hooks/usePlaylistCard';

interface PlaylistCardProps {
    playlist: Tables<'playlists'>;
    onDelete?: () => void;
    lastUpdated?: number;
    initialIsLiked?: boolean;
    onToggleFavorite?: (id: string, isFav: boolean) => void;
    onPlaylistUpdate?: (id: string, updates: Partial<EnhancedPlaylist>) => void;
    onUpdate?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
    playlist, onDelete, lastUpdated, initialIsLiked, onToggleFavorite, onPlaylistUpdate, onUpdate
}) => {
    const {
        isFavourite,
        showAddTrackModal, setShowAddTrackModal,
        isExpanded, setIsExpanded,
        isInlineExpanded, setIsInlineExpanded,
        imgError, setImgError,
        title, setTitle,
        color, setColor,
        previewTracks,
        setNodeRef,
        isOver,
        handleFavourite,
        handleTrackAdded
    } = usePlaylistCard({
        playlist,
        initialIsLiked,
        onToggleFavorite,
        lastUpdated
    });

    return (
        <>
            <div
                ref={setNodeRef}
                className={`bg-[#131313]/80 p-4 rounded-xl flex flex-col shadow-md relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${isInlineExpanded ? 'min-h-[20rem] max-h-[28rem] h-auto' : 'h-80'} ${isOver ? 'ring-2 ring-white/50 bg-[#2a2a2a] shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 px-1">
                    <h3 className="font-medium text-[#E0E0E0] text-lg line-clamp-2 leading-tight">{title}</h3>
                    <div className="flex space-x-3 text-[#FFD1D1]">
                        <div className="cursor-pointer pt-1">
                            <FavButton
                                isFavourite={isFavourite}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavourite();
                                }}
                            />
                        </div>
                        <ExpandButton strokeColor="white" onClick={() => setIsExpanded(true)} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    {/* Playlist Image */}
                    <div className="bg-[#292929] rounded-2xl h-32 w-full shrink-0 overflow-hidden relative">
                        {/*FIX: Check playlist.playlistimg_url directly */}
                        {!imgError && playlist.playlistimg_url ? (
                            <img
                                //FIX: Use the DB column
                                src={playlist.playlistimg_url}
                                alt={title}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : color ? (
                            <div className="w-full h-full" style={{ backgroundColor: color + '80' }} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Track Preview Area */}
                    <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                        {isInlineExpanded ? (
                            // ... Expanded List
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {previewTracks.length > 0 ? (
                                    <SortableContext
                                        items={previewTracks.map(t => `${playlist.id}::${t.id}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {previewTracks.map((track) => (
                                            <DraggableTrackRow key={track.id} track={track} playlistId={playlist.id}>
                                                <div className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors group/track">
                                                    <div className="w-8 h-8 rounded overflow-hidden bg-[#282828] shrink-0">
                                                        {track.album?.images?.[0]?.url ? (
                                                            <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm text-gray-200 font-medium truncate group-hover/track:text-white transition-colors">{track.name}</div>
                                                        <div className="text-xs text-gray-500 truncate">{track.artists?.[0]?.name}</div>
                                                    </div>
                                                </div>
                                            </DraggableTrackRow>
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <div className="text-xs text-gray-500 text-center py-4 italic">
                                        {playlist.track_count === 0 ? "No tracks yet" : "Loading tracks..."}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ... Collapsed View
                            <div className="pt-1">
                                {previewTracks.length > 0 ? (
                                    <DraggableTrackRow track={previewTracks[0]} playlistId={playlist.id}>
                                        <div className="flex items-center gap-3 p-1.5 rounded-lg bg-white/5">
                                            <div className="w-8 h-8 rounded overflow-hidden bg-[#282828] shrink-0">
                                                {previewTracks[0].album?.images?.[0]?.url ? (
                                                    <img src={previewTracks[0].album.images[0].url} alt={previewTracks[0].name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-gray-200 font-medium truncate">{previewTracks[0].name}</div>
                                                <div className="text-xs text-gray-500 truncate">{previewTracks[0].artists?.[0]?.name}</div>
                                            </div>
                                        </div>
                                    </DraggableTrackRow>
                                ) : (
                                    <div className="text-xs text-gray-500 px-1">
                                        {playlist.track_count || 0} tracks
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-white/5 flex flex-col items-center gap-2 shrink-0">
                    {isInlineExpanded ? (
                        <>
                            <div
                                onClick={() => setShowAddTrackModal(true)}
                                className="w-full bg-[#282828] hover:bg-[#333] transition-colors rounded-md py-1.5 px-3 flex items-center gap-2 cursor-pointer group/search"
                            >
                                <svg className="w-4 h-4 text-gray-500 group-hover/search:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-xs text-gray-400 group-hover/search:text-gray-200">Add songs...</span>
                            </div>
                            <div className="flex justify-center py-1">
                                <CollapseVerticalButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsInlineExpanded(false);
                                    }}
                                    className="text-gray-500 hover:text-white transition-colors"
                                />
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsInlineExpanded(true)}
                            className="text-[#D1D1D1] text-sm font-medium hover:text-white transition py-1"
                        >
                            {previewTracks.length > 0 || (playlist.track_count && playlist.track_count > 0) ? "View more" : "Add tracks"}
                        </button>
                    )}
                </div>
            </div>

            {showAddTrackModal && (
                <AddTrackModal
                    playlistId={playlist.id}
                    playlistName={title}
                    onClose={() => setShowAddTrackModal(false)}
                    onTrackAdded={handleTrackAdded}
                />
            )}

            {isExpanded && (
                <ExpandedPlaylistCard
                    playlist={playlist}
                    onClose={() => setIsExpanded(false)}
                    onTitleChange={setTitle}
                    currentTitle={title}
                    onDeletePlaylist={onDelete}
                    onColorChange={setColor}
                    currentColor={color}
                    onPlaylistUpdate={onPlaylistUpdate}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default PlaylistCard;