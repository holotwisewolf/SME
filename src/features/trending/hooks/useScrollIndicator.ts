// useScrollIndicator - Custom hook for managing scroll indicator state and behavior

import { useState, useEffect, RefObject } from 'react';

interface UseScrollIndicatorReturn {
    showIndicator: boolean;
    isHovering: boolean;
    setIsHovering: (hovering: boolean) => void;
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    scrollToRankings: () => void;
}

export function useScrollIndicator(
    scrollContainerRef: RefObject<HTMLDivElement | null>,
    allTrendingRef: RefObject<HTMLHeadingElement | null>,
    hasContent: boolean
): UseScrollIndicatorReturn {
    const [showIndicator, setShowIndicator] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    // Reset indicator when content changes
    useEffect(() => {
        if (hasContent) {
            setShowIndicator(true);
        }
    }, [hasContent]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        // Show indicator when at top, hide after minimal scroll
        const hasScrolled = target.scrollTop > 50;
        setShowIndicator(!hasScrolled);
    };

    const scrollToRankings = () => {
        allTrendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return {
        showIndicator,
        isHovering,
        setIsHovering,
        handleScroll,
        scrollToRankings,
    };
}
