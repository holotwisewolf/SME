import { useState, useRef, useEffect } from 'react';

interface ResultMenuDropdownProps {
    trackId: string;
    trackName: string;
    onAddToFavourites: (trackId: string) => void;
    onAddToPlaylist: (trackId: string) => void;
}

/**
 * Dropdown menu for track actions
 * Uses click-outside detection without blocking scrolling
 */
export function ResultMenuDropdown({
    trackId,
    onAddToFavourites,
    onAddToPlaylist
}: ResultMenuDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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
                setIsOpen(false);
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
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            // Check if dropdown would overflow the scroll container
            const button = buttonRef.current;
            const scrollContainer = button.closest('.overflow-y-auto');

            if (scrollContainer) {
                const buttonRect = button.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                const dropdownHeight = 50;

                const spaceBelow = containerRect.bottom - buttonRect.bottom;
                setOpenUpward(spaceBelow < dropdownHeight);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isOpen]);

    const handleAddToFavourites = () => {
        onAddToFavourites(trackId);
        setIsOpen(false);
    };

    const handleAddToPlaylist = () => {
        onAddToPlaylist(trackId);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className="p-2 hover:bg-[#282828] rounded-full transition-colors focus:outline-none"
                aria-label="More options"
            >
                <svg
                    className="w-5 h-5 text-gray-400 hover:text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={`absolute right-0 w-48 bg-[#1f1f1f] rounded-lg shadow-xl z-[70] border border-gray-700 overflow-hidden ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="py-1">
                        <button
                            onClick={handleAddToFavourites}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors"
                        >
                            Add to Favourites
                        </button>
                        <button
                            onClick={handleAddToPlaylist}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#282828] hover:text-white transition-colors"
                        >
                            Add to Playlist
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}