import { useRef, useCallback, useState, useEffect } from 'react';
import type { RecommendedItem } from '../types/recommendation_types';

interface UseParallaxTrackProps {
    items: RecommendedItem[];
    tabs?: { id: string; label: string; items: RecommendedItem[] }[];
}

export const useParallaxTrack = ({ items, tabs }: UseParallaxTrackProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [activeTabId, setActiveTabId] = useState(tabs?.[0]?.id || '');
    const [currentPercentage, setCurrentPercentage] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [maxScrollPercentage, setMaxScrollPercentage] = useState(-100);

    // Drag state refs
    const isDraggingRef = useRef(false);
    const isMouseDownRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartTimeRef = useRef(0);

    // Sync activeTabId when tabs change
    useEffect(() => {
        if (tabs && tabs.length > 0 && !tabs.find(t => t.id === activeTabId)) {
            setActiveTabId(tabs[0].id);
        }
    }, [tabs, activeTabId]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    // Calculate display items based on active tab
    const displayItems = tabs
        ? tabs.find(t => t.id === activeTabId)?.items || items
        : items;

    // Calculate max scroll percentage
    useEffect(() => {
        const calculateMaxScroll = () => {
            if (!trackRef.current || !containerRef.current) return;
            const trackWidth = trackRef.current.scrollWidth;
            const containerWidth = containerRef.current.clientWidth;
            // If content is smaller than container, maxScroll is 0 (cannot scroll)
            const maxScroll = Math.min(0, -((trackWidth - containerWidth) / trackWidth) * 100);
            setMaxScrollPercentage(maxScroll);
        };

        calculateMaxScroll();
        // Recalculate after a short delay to ensure images/layout have stabilized
        const timeoutId = setTimeout(calculateMaxScroll, 100);

        window.addEventListener('resize', calculateMaxScroll);
        return () => {
            window.removeEventListener('resize', calculateMaxScroll);
            clearTimeout(timeoutId);
        };
    }, [displayItems]);

    // Drag handlers
    const handleOnDown = useCallback((clientX: number) => {
        if (!trackRef.current) return;
        isMouseDownRef.current = true;
        trackRef.current.dataset.mouseDownAt = String(clientX);
        isDraggingRef.current = false;
        dragStartXRef.current = clientX;
        dragStartTimeRef.current = Date.now();
    }, []);

    const handleOnUp = useCallback(() => {
        if (!trackRef.current) return;
        isMouseDownRef.current = false;
        isDraggingRef.current = false;
        trackRef.current.dataset.mouseDownAt = "0";
        trackRef.current.dataset.prevPercentage = trackRef.current.dataset.percentage || "0";
    }, []);

    const handleOnMove = useCallback((clientX: number) => {
        if (!trackRef.current || !isMouseDownRef.current) return;
        if (trackRef.current.dataset.mouseDownAt === "0") return;

        const moveDistance = Math.abs(clientX - dragStartXRef.current);
        if (moveDistance > 10) {
            isDraggingRef.current = true;
        }

        const mouseDelta = parseFloat(trackRef.current.dataset.mouseDownAt || "0") - clientX;
        const maxDelta = window.innerWidth * 1.5;

        const percentage = (mouseDelta / maxDelta) * -100;
        const prevPercentage = parseFloat(trackRef.current.dataset.prevPercentage || "0");
        const nextPercentageUnconstrained = prevPercentage + percentage;
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), maxScrollPercentage);

        trackRef.current.dataset.percentage = String(nextPercentage);
        setCurrentPercentage(nextPercentage);

        trackRef.current.animate({
            transform: `translate(${nextPercentage}%, 0%)`
        }, { duration: 1200, fill: "forwards" });

        const images = trackRef.current.getElementsByClassName("parallax-image");
        for (const image of images) {
            (image as HTMLElement).animate({
                objectPosition: `${100 + nextPercentage}% center`
            }, { duration: 1200, fill: "forwards" });
        }
    }, [maxScrollPercentage]);

    const wasClick = useCallback((): boolean => {
        const timeDelta = Date.now() - dragStartTimeRef.current;
        return !isDraggingRef.current && timeDelta < 200;
    }, []);

    // Event handlers for component
    const onMouseDown = useCallback((e: React.MouseEvent) => handleOnDown(e.clientX), [handleOnDown]);
    const onMouseUp = useCallback(() => handleOnUp(), [handleOnUp]);
    const onMouseMove = useCallback((e: React.MouseEvent) => handleOnMove(e.clientX), [handleOnMove]);
    const onTouchStart = useCallback((e: React.TouchEvent) => handleOnDown(e.touches[0].clientX), [handleOnDown]);
    const onTouchEnd = useCallback(() => handleOnUp(), [handleOnUp]);
    const onTouchMove = useCallback((e: React.TouchEvent) => handleOnMove(e.touches[0].clientX), [handleOnMove]);

    // Global mouse up handler
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isMouseDownRef.current) handleOnUp();
        };
        const handleGlobalTouchEnd = () => {
            if (isMouseDownRef.current) handleOnUp();
        };
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (e.buttons === 0 && isMouseDownRef.current) handleOnUp();
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('touchend', handleGlobalTouchEnd);
        window.addEventListener('touchcancel', handleGlobalTouchEnd);
        window.addEventListener('mousemove', handleGlobalMouseMove);

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchend', handleGlobalTouchEnd);
            window.removeEventListener('touchcancel', handleGlobalTouchEnd);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [handleOnUp]);

    // Tab change handler
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTabId(tabId);
        setShowDropdown(false);
        setCurrentPercentage(0);
        // Reset to allow arrows to recalculate properly after items change
        setMaxScrollPercentage(-100);
        if (trackRef.current) {
            trackRef.current.dataset.percentage = "0";
            trackRef.current.dataset.prevPercentage = "0";
            trackRef.current.style.transform = 'translate(0%, 0%)';
            const images = trackRef.current.getElementsByClassName("parallax-image");
            for (const image of images) {
                (image as HTMLElement).style.objectPosition = '100% center';
            }
        }
    }, []);

    // Next page handler
    const handleNextPage = useCallback(() => {
        if (!trackRef.current) return;

        const newPercentage = Math.max(currentPercentage - 20, maxScrollPercentage);
        trackRef.current.dataset.percentage = String(newPercentage);
        trackRef.current.dataset.prevPercentage = String(newPercentage);
        setCurrentPercentage(newPercentage);

        trackRef.current.animate({
            transform: `translate(${newPercentage}%, 0%)`
        }, { duration: 500, fill: "forwards" });

        const images = trackRef.current.getElementsByClassName("parallax-image");
        for (const image of images) {
            (image as HTMLElement).animate({
                objectPosition: `${100 + newPercentage}% center`
            }, { duration: 500, fill: "forwards" });
        }
    }, [currentPercentage, maxScrollPercentage]);

    // Previous page handler
    const handlePrevPage = useCallback(() => {
        if (!trackRef.current) return;

        const newPercentage = Math.min(currentPercentage + 20, 0);
        trackRef.current.dataset.percentage = String(newPercentage);
        trackRef.current.dataset.prevPercentage = String(newPercentage);
        setCurrentPercentage(newPercentage);

        trackRef.current.animate({
            transform: `translate(${newPercentage}%, 0%)`
        }, { duration: 500, fill: "forwards" });

        const images = trackRef.current.getElementsByClassName("parallax-image");
        for (const image of images) {
            (image as HTMLElement).animate({
                objectPosition: `${100 + newPercentage}% center`
            }, { duration: 500, fill: "forwards" });
        }
    }, [currentPercentage]);

    const canGoNext = currentPercentage > maxScrollPercentage;
    const canGoPrev = currentPercentage < 0;
    const activeTab = tabs?.find(t => t.id === activeTabId);

    return {
        // Refs
        trackRef,
        containerRef,
        dropdownRef,

        // State
        activeTabId,
        showDropdown,
        setShowDropdown,
        displayItems,
        canGoNext,
        canGoPrev,
        activeTab,
        isMouseDown: isMouseDownRef.current,

        // Handlers
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onTouchStart,
        onTouchEnd,
        onTouchMove,
        handleTabChange,
        handleNextPage,
        handlePrevPage,
        wasClick
    };
};
