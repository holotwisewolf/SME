import React from 'react';
import FavButton from '../../../../components/ui/FavButton';
import ExpandButton from '../../../../components/ui/ExpandButton';
import CollapseVerticalButton from '../../../../components/ui/CollapseVerticalButton';
import { ExpandedAlbumCard } from './expanded_card/ExpandedAlbumCard';
import { useAlbumCard } from '../hooks/useAlbumCard';

interface AlbumCardProps {
    albumId: string;
    onRemove?: () => void;
    searchQuery?: string;
    initialData?: any;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ albumId, onRemove, searchQuery = '', initialData }) => {
    const {
        isFavourite,
        isExpanded, setIsExpanded,
        isInlineExpanded, setIsInlineExpanded,
        album,
        previewTracks,
        loading,
        handleFavourite
    } = useAlbumCard({ albumId, onRemove });

    if (loading || !album) {
        return (
            <div className="bg-[#131313]/80 p-4 rounded-xl flex flex-col shadow-md h-80 animate-pulse">
                <div className="bg-[#292929] rounded-2xl h-32 w-full mb-4"></div>
                <div className="h-4 bg-[#292929] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#292929] rounded w-1/2"></div>
            </div>
        );
    }

    // Filter based on search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const albumName = album.name?.toLowerCase() || '';
        const artistName = album.artists?.[0]?.name?.toLowerCase() || '';

        if (!albumName.includes(query) && !artistName.includes(query)) {
            return null; // Hide card if it doesn't match search
        }
    }

    return (
        <>
            <div
                className={`bg-[#131313]/80 p-4 rounded-xl flex flex-col shadow-md relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${isInlineExpanded ? 'min-h-[20rem] max-h-[28rem] h-auto' : 'h-80'}`}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4 px-1">
                    <h3 className="font-medium text-[#E0E0E0] text-lg line-clamp-2 leading-tight">{album.name}</h3>
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
                    {/* Album Image */}
                    <div className="bg-[#292929] rounded-2xl h-32 w-full shrink-0 overflow-hidden relative">
                        {album.images?.[0]?.url ? (
                            <img
                                src={album.images[0].url}
                                alt={album.name}
                                className="w-full h-full object-cover"
                            />
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
                            // Expanded: Scrollable List
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {previewTracks.length > 0 ? (
                                    previewTracks.map((track) => (
                                        <div key={track.id} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors group/track">
                                            <div className="w-8 h-8 rounded overflow-hidden bg-[#282828] shrink-0">
                                                {album.images?.[0]?.url ? (
                                                    <img src={album.images[0].url} alt={track.name} className="w-full h-full object-cover" />
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
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-500 text-center py-4 italic">
                                        No tracks available
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Collapsed: First Track Only
                            <div className="pt-1">
                                {previewTracks.length > 0 ? (
                                    <div className="flex items-center gap-3 p-1.5 rounded-lg bg-white/5">
                                        <div className="w-8 h-8 rounded overflow-hidden bg-[#282828] shrink-0">
                                            {album.images?.[0]?.url ? (
                                                <img src={album.images[0].url} alt={previewTracks[0].name} className="w-full h-full object-cover" />
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
                                ) : (
                                    <div className="text-xs text-gray-500 px-1">
                                        {album.total_tracks || 0} tracks
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-2 border-t border-white/5 flex flex-col items-center gap-2 shrink-0">
                    {isInlineExpanded ? (
                        <div className="flex justify-center py-1">
                            <CollapseVerticalButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsInlineExpanded(false);
                                }}
                                className="text-gray-500 hover:text-white transition-colors"
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsInlineExpanded(true)}
                            className="text-[#D1D1D1] text-sm font-medium hover:text-white transition py-1"
                        >
                            {previewTracks.length > 0 ? "View more" : "View album"}
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <ExpandedAlbumCard
                    albumId={albumId}
                    onClose={() => setIsExpanded(false)}
                    onRemove={() => {
                        setIsExpanded(false);
                        onRemove?.();
                    }}
                />
            )}
        </>
    );
};

export default AlbumCard;
