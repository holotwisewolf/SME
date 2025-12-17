import React, { useState, useRef, useEffect } from 'react';
import { SpotifyService } from '../../../spotify/services/spotify_services';
import MoveOrderIcon from '../../../../components/ui/MoveOrderIcon';
import MoreOptionsIcon from '../../../../components/ui/MoreOptionsIcon';
import { Trash2 } from 'lucide-react';

interface PlaylistTrackItemProps {
    item: any;
    index?: number;
    isEditingEnabled: boolean;
    onRemoveTrack?: (trackId: string) => void;
    onTrackClick?: (track: any) => void;
    isDragging?: boolean;
    isOverlay?: boolean;
    isTrashCandidate?: boolean;
    dragHandleProps?: any;
}

export const PlaylistTrackItem: React.FC<PlaylistTrackItemProps> = ({
    item,
    index,
    isEditingEnabled,
    onRemoveTrack,
    onTrackClick,
    isDragging,
    isOverlay,
    isTrashCandidate,
    dragHandleProps
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMenuAction = (action: 'remove' | 'spotify') => {
        setShowMenu(false);
        if (action === 'remove') {
            if (window.confirm('Are you sure you want to remove this track from the playlist?')) {
                onRemoveTrack?.(item.spotify_track_id);
            }
        } else if (action === 'spotify') {
            if (item.details?.external_urls?.spotify) {
                window.open(item.details.external_urls.spotify, '_blank');
            }
        }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to remove this track from the playlist?')) {
            onRemoveTrack?.(item.spotify_track_id);
        }
    };

    // If it's a trash candidate (dragged out), we might want to style it differently
    const containerClass = `flex items-center justify-between p-2 rounded-lg group transition-colors cursor-pointer relative ${isTrashCandidate
        ? 'bg-red-500/20 border border-red-500/50'
        : isDragging
            ? 'bg-[#292929] shadow-xl ring-2 ring-[#1DB954] opacity-90'
            : 'hover:bg-white/5'
        }`;

    return (
        <div
            className={containerClass}
            onClick={() => !isOverlay && onTrackClick?.(item.details)}
        >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {isEditingEnabled ? (
                    <div
                        {...dragHandleProps}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoveOrderIcon className="w-5 h-5" color="#9ca3af" />
                    </div>
                ) : (
                    <span className="text-gray-500 w-6 text-center text-sm">{index !== undefined ? index + 1 : '-'}</span>
                )}

                <div className="w-10 h-10 bg-[#2a2a2a] rounded flex-shrink-0 overflow-hidden">
                    {item.details?.album?.images?.[0]?.url && (
                        <img src={item.details.album.images[0].url} alt="Album" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm font-medium truncate ${isTrashCandidate ? 'text-red-200' : 'text-white'}`}>
                        {item.details?.name || 'Unknown Track'}
                    </span>
                    <span className={`text-xs truncate ${isTrashCandidate ? 'text-red-300/70' : 'text-gray-400'}`}>
                        {item.details?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 w-[160px] justify-end relative">
                {isTrashCandidate ? (
                    <div className="flex items-center gap-2 text-red-500 font-bold">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-sm">Remove</span>
                    </div>
                ) : (
                    <>
                        <span className="text-gray-500 text-xs font-mono">
                            {item.details ? SpotifyService.formatDuration(item.details.duration_ms) : '--:--'}
                        </span>

                        {!isEditingEnabled && !isOverlay && (
                            <div className="relative" ref={menuRef}>
                                <div
                                    className="w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(!showMenu);
                                    }}
                                >
                                    <MoreOptionsIcon size={18} />
                                </div>

                                {showMenu && (
                                    <div className="absolute right-0 top-6 w-40 bg-[#282828] rounded-md shadow-xl border border-[#3e3e3e] z-50 overflow-hidden">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuAction('spotify');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3e3e3e] transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                            View on Spotify
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuAction('remove');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[#3e3e3e] transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditingEnabled && !isOverlay && (
                            <button
                                onClick={handleRemoveClick}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-100"
                                title="Remove"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
