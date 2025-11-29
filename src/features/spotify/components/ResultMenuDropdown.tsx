import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreOptionsIcon } from '../../../components/ui/MoreOptionsIcon';

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
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
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