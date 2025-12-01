import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreOptionsIcon } from '../../../components/ui/MoreOptionsIcon';
import SpotifyIcon from '../../../components/ui/SpotifyIcon';

interface ResultMenuDropdownProps {
    trackId: string;
    trackName?: string;
    spotifyUrl?: string;
    isOpen: boolean;
    onToggle: (isOpen: boolean) => void;
    onAddToFavourites: (id: string) => void;
    onAddToPlaylist?: (id: string) => void;
    onImportToPlaylist?: (id: string) => void;
    hideActions?: boolean;
    type?: 'track' | 'album' | 'artist';
    orientation?: 'vertical' | 'horizontal';
    showFavourites?: boolean;
    placement?: 'bottom-end' | 'right-start';
}

/**
 * Dropdown menu for track/album actions
 * Uses React Portal to render outside of overflow-hidden containers
 */
export function ResultMenuDropdown({
    trackId,
    spotifyUrl,
    isOpen,
    onToggle,
    onAddToFavourites,
    onAddToPlaylist,
    onImportToPlaylist,
    hideActions = false,
    type = 'track',
    orientation = 'vertical',
    showFavourites = true,
    placement = 'bottom-end'
}: ResultMenuDropdownProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    // Calculate position when opening
    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = 0;
            let left = 0;

            if (placement === 'right-start') {
                top = rect.top + scrollY;
                left = rect.right + scrollX + 8;
            } else {
                // Default 'bottom-end' (aligned right)
                top = rect.bottom + scrollY + 8;
                left = rect.right + scrollX - 192; // 192px is w-48
            }

            setMenuPosition({ top, left });
        } else {
            setMenuPosition(null);
        }
    }, [isOpen, placement]);

    // Click-outside detection
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Close if click is outside both button and menu
            if (
                buttonRef.current && !buttonRef.current.contains(target) &&
                menuRef.current && !menuRef.current.contains(target)
            ) {
                onToggle(false);
            }
        };

        // Add listener with a small delay to prevent immediate closure
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    const handleAddToFavourites = () => {
        onAddToFavourites(trackId);
        onToggle(false);
    };

    const handleAddToPlaylist = () => {
        if (onAddToPlaylist) {
            onAddToPlaylist(trackId);
            onToggle(false);
        }
    };

    const handleImportToPlaylist = () => {
        if (onImportToPlaylist) {
            onImportToPlaylist(trackId);
            onToggle(false);
        }
    };

    const handleViewOnSpotify = () => {
        if (spotifyUrl) {
            window.open(spotifyUrl, '_blank');
        }
        onToggle(false);
    };

    const menuContent = menuPosition && (
        <div
            ref={menuRef}
            className="fixed w-48 bg-[#1f1f1f] rounded-lg shadow-xl z-[9999] border border-gray-700 overflow-hidden"
            style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="py-1">
                {!hideActions && (
                    <>
                        {showFavourites && (
                            <button
                                onClick={handleAddToFavourites}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors"
                            >
                                Add to Favourites
                            </button>
                        )}

                        {type === 'track' && onAddToPlaylist && (
                            <button
                                onClick={handleAddToPlaylist}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors"
                            >
                                Add to Playlist
                            </button>
                        )}

                        {type === 'album' && onImportToPlaylist && (
                            <button
                                onClick={handleImportToPlaylist}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors"
                            >
                                Import to Playlist
                            </button>
                        )}

                        {(showFavourites || (type === 'track' && onAddToPlaylist) || (type === 'album' && onImportToPlaylist)) && (
                            <div className="border-t border-gray-700 my-1"></div>
                        )}
                    </>
                )}
                <button
                    onClick={handleViewOnSpotify}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors flex items-center gap-2"
                >
                    <SpotifyIcon size={16} color="currentColor" />
                    Spotify
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(!isOpen);
                }}
                className="p-2 hover:bg-[#282828] rounded-full transition-colors focus:outline-none"
                aria-label="More options"
            >
                <MoreOptionsIcon orientation={orientation} />
            </button>

            {isOpen && createPortal(menuContent, document.body)}
        </div>
    );
}