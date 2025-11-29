import { useState, useCallback } from 'react';
import type { ArtistFullDetail } from '../type/artist_type';

/**
 * Hook for managing artist popup state
 */
export function useArtistPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<ArtistFullDetail | null>(null);

    const openPopup = useCallback((artist: ArtistFullDetail) => {
        setSelectedArtist(artist);
        setIsOpen(true);
    }, []);

    const closePopup = useCallback(() => {
        setIsOpen(false);
        // Delay clearing artist data to allow for exit animation
        setTimeout(() => setSelectedArtist(null), 300);
    }, []);

    return {
        isOpen,
        selectedArtist,
        openPopup,
        closePopup
    };
}
