// ParallaxImageTrack - Draggable horizontal carousel with parallax cover effect
// Fixed: slower drag speed, proper mouse release, cleaner navigation arrow, dropdown tabs

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import type { RecommendedItem } from '../types/recommendation_types';
import { useTrackPreview } from '../../spotify/hooks/useTrackPreview';
import FavButton from '../../../components/ui/FavButton';
import ExpandButton from '../../../components/ui/ExpandButton';

interface ParallaxImageTrackProps {
    items: RecommendedItem[];
    title?: string;
    subtitle?: string;
    onItemClick?: (item: RecommendedItem) => void;
    onAddToFavourites?: (item: RecommendedItem, isFavourite: boolean) => void;
    onAddToPlaylist?: (item: RecommendedItem) => void;
    onRefresh?: () => Promise<void>;
    isRefreshing?: boolean;
    tabs?: { id: string; label: string; items: RecommendedItem[] }[];
    extraHeaderContent?: React.ReactNode;
}

const ParallaxImageTrack: React.FC<ParallaxImageTrackProps> = ({
    items,
    title,
    subtitle,
    onItemClick,
    onAddToFavourites,
    onRefresh,
    isRefreshing,
    tabs,
    extraHeaderContent
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { playPreview, stopPreview, currentTrackId } = useTrackPreview();
    const [activeTabId, setActiveTabId] = useState(tabs?.[0]?.id || '');
    const [currentPercentage, setCurrentPercentage] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [maxScrollPercentage, setMaxScrollPercentage] = useState(-100);

    // Track drag state
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

    const displayItems = tabs
        ? tabs.find(t => t.id === activeTabId)?.items || items
        : items;

    // Calculate max scroll percentage based on actual track width
    useEffect(() => {
        const calculateMaxScroll = () => {
            if (!trackRef.current || !containerRef.current) return;
            const trackWidth = trackRef.current.scrollWidth;
            const containerWidth = containerRef.current.clientWidth;
            // Only allow scrolling until last card hits right edge
            const maxScroll = Math.min(0, -((trackWidth - containerWidth) / trackWidth) * 100);
            setMaxScrollPercentage(maxScroll);
        };

        calculateMaxScroll();
        window.addEventListener('resize', calculateMaxScroll);
        return () => window.removeEventListener('resize', calculateMaxScroll);
    }, [displayItems]);

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
        const maxDelta = window.innerWidth * 1.5; // Slower drag

        const percentage = (mouseDelta / maxDelta) * -100;
        const prevPercentage = parseFloat(trackRef.current.dataset.prevPercentage || "0");
        const nextPercentageUnconstrained = prevPercentage + percentage;
        // Use dynamic max scroll so last card stops at right edge
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

    const onMouseDown = useCallback((e: React.MouseEvent) => handleOnDown(e.clientX), [handleOnDown]);
    const onMouseUp = useCallback(() => handleOnUp(), [handleOnUp]);
    const onMouseMove = useCallback((e: React.MouseEvent) => handleOnMove(e.clientX), [handleOnMove]);
    const onTouchStart = useCallback((e: React.TouchEvent) => handleOnDown(e.touches[0].clientX), [handleOnDown]);
    const onTouchEnd = useCallback(() => handleOnUp(), [handleOnUp]);
    const onTouchMove = useCallback((e: React.TouchEvent) => handleOnMove(e.touches[0].clientX), [handleOnMove]);

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isMouseDownRef.current) {
                handleOnUp();
            }
        };
        const handleGlobalTouchEnd = () => {
            if (isMouseDownRef.current) {
                handleOnUp();
            }
        };
        // Also check during mousemove if button is no longer pressed
        const handleGlobalMouseMove = (e: MouseEvent) => {
            // If no buttons are pressed but we think we're dragging, reset
            if (e.buttons === 0 && isMouseDownRef.current) {
                handleOnUp();
            }
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

    const handleTabChange = useCallback((tabId: string) => {
        setActiveTabId(tabId);
        setShowDropdown(false);
        setCurrentPercentage(0);
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

    const handleNextPage = useCallback(() => {
        if (!trackRef.current) return;

        // Scroll by ~2 cards (20% instead of 50%)
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

    const canGoNext = currentPercentage > maxScrollPercentage;
    const activeTab = tabs?.find(t => t.id === activeTabId);

    return (
        <div className="w-full flex flex-col">
            {/* Header with Dropdown */}
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    {(title || subtitle) && (
                        <div>
                            {title && <h2 className="text-2xl font-bold text-[#D1D1D1]">{title}</h2>}
                            {subtitle && <p className="text-sm text-[#D1D1D1]/60 mt-1">{subtitle}</p>}
                        </div>
                    )}
                    {extraHeaderContent}
                </div>
                <div className="flex items-center gap-2">
                    {tabs && tabs.length > 0 && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-all duration-200"
                            >
                                <span className="font-medium">{activeTab?.label}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`w-full px-4 py-3 text-left transition-all duration-200 ${activeTabId === tab.id
                                                ? 'bg-white/20 text-white font-medium'
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-[#292929] hover:bg-[#3a3a3a] text-[#D1D1D1] rounded-lg border border-[#D1D1D1]/10 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {displayItems.length === 0 ? (
                <div
                    className="w-full flex items-center justify-center text-white/50 border border-white/5 rounded-2xl bg-white/5"
                    style={{ height: '56vmin' }}
                >
                    <p>No items found in this section</p>
                </div>
            ) : (
                /* Parallax Track Container */
                <div
                    ref={containerRef}
                    className="relative w-full select-none overflow-x-clip overflow-y-visible"
                    style={{ height: '56vmin', cursor: isMouseDownRef.current ? 'grabbing' : 'grab' }}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchMove}
                >
                    {/* Image Track - starts at left edge, not center */}
                    <div
                        ref={trackRef}
                        className="absolute left-0 h-full flex items-center pl-2"
                        style={{
                            transform: 'translate(0%, 0%)',
                            gap: '4vmin'
                        }}
                        data-mouse-down-at="0"
                        data-prev-percentage="0"
                        data-percentage="0"
                    >
                        {displayItems.map((item) => (
                            <ParallaxCard
                                key={item.id}
                                item={item}
                                onItemClick={onItemClick}
                                onAddToFavourites={onAddToFavourites}
                                isPlaying={currentTrackId === item.id}
                                onPlayToggle={(url) => {
                                    if (currentTrackId === item.id) {
                                        stopPreview();
                                    } else if (url) {
                                        playPreview(url, item.id);
                                    }
                                }}
                                wasClick={wasClick}
                            />
                        ))}
                    </div>

                    {/* Right Arrow Navigation */}
                    {canGoNext && (
                        <button
                            onClick={handleNextPage}
                            className="absolute right-0 top-0 h-full w-20 z-20 group flex items-center justify-end pr-4"
                        >
                            {/* Vertical glow effect */}
                            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Arrow icon */}
                            <ChevronRight className="w-10 h-10 text-white/60 group-hover:text-white transition-all duration-300 relative z-10" strokeWidth={2} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Card component
interface ParallaxCardProps {
    item: RecommendedItem;
    onItemClick?: (item: RecommendedItem) => void;
    onAddToFavourites?: (item: RecommendedItem, isFavourite: boolean) => void;
    isPlaying: boolean;
    onPlayToggle: (previewUrl?: string) => void;
    wasClick: () => boolean;
}

const ParallaxCard: React.FC<ParallaxCardProps> = ({
    item,
    onItemClick,
    onAddToFavourites,
    isPlaying,
    onPlayToggle,
    wasClick
}) => {
    const [imgError, setImgError] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFavourite, setIsFavourite] = React.useState(false);
    const buttonClickedRef = React.useRef(false);

    const handleFavClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        buttonClickedRef.current = true;
        const newFavState = !isFavourite;
        setIsFavourite(newFavState);
        onAddToFavourites?.(item, newFavState);
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        buttonClickedRef.current = true;
        onItemClick?.(item);
    };

    // Set flag on mousedown (fires BEFORE mouseup on card)
    const handleButtonMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        buttonClickedRef.current = true;
    };

    const handleCardMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Only open if it was a quick click AND no button was clicked
        if (wasClick() && !buttonClickedRef.current) {
            onItemClick?.(item);
        }
        // Reset after checking
        buttonClickedRef.current = false;
    };

    return (
        <div
            className="relative flex-shrink-0 overflow-hidden group transition-all duration-300 ease-out"
            style={{
                width: '40vmin',
                height: '100%',
                borderRadius: '12px',
                transform: isHovered ? 'scale(1.05) translateY(-8px)' : 'scale(1) translateY(0)',
                boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
                zIndex: isHovered ? 20 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseUp={handleCardMouseUp}
        >
            {/* Parallax Image - 300% width for more pronounced panning effect */}
            {!imgError && item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="parallax-image absolute top-0 left-0 h-full"
                    style={{
                        width: '200%',
                        objectFit: 'cover',
                        objectPosition: '100% center'
                    }}
                    onError={() => setImgError(true)}
                    draggable={false}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFD1D1]/30 to-[#696969]/50">
                    <span className="text-6xl">🎵</span>
                </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Quick Actions */}
            <div
                className={`absolute top-3 right-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="flex items-center justify-center h-8 px-2 gap-1 bg-black/20 backdrop-blur-md rounded-xl hover:bg-black transition-colors duration-300">
                    <div className="scale-80 flex items-center" onMouseDown={handleButtonMouseDown}>
                        <FavButton isFavourite={isFavourite} onClick={handleFavClick} />
                    </div>
                    <div className="scale-80 flex items-center" onMouseDown={handleButtonMouseDown}>
                        <ExpandButton onClick={handleExpandClick} strokeColor="white" />
                    </div>
                </div>
            </div>

            {/* Play button */}
            {item.previewUrl && (
                <button
                    className={`absolute top-3 left-3 w-10 h-10 rounded-full bg-[#FFD1D1] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 ${isHovered || isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                    onMouseDown={handleButtonMouseDown}
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlayToggle(item.previewUrl);
                    }}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4" fill="currentColor" />
                    ) : (
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                </button>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base truncate mb-0.5">
                    {item.name}
                </h3>
                <p className="text-white/70 text-sm truncate mb-2">
                    {item.artist}
                </p>

                {/* Raw Score */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[#FFD1D1] font-mono text-lg font-bold">
                            {item.score.toFixed(0)}
                        </span>
                        <span className="text-white/50 text-xs">score</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                        <span className="text-white/80 text-xs font-medium">
                            {item.matchPercentage}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallaxImageTrack;