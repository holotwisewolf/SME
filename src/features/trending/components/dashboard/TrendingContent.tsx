// TrendingContent - Main content area displaying top 3 and rankings

import React, { type RefObject } from 'react';
import HeroCard from './HeroCard';
import FeaturedBanner from './FeaturedBanner';
import TrendingRow from './TrendingRow';
import ScrollIndicator from './ScrollIndicator';
import type { TrendingItem } from '../../types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

interface TrendingContentProps {
    activeTab: TabType;
    topThree: TrendingItem[];
    remaining: TrendingItem[];
    onItemClick: (item: TrendingItem) => void;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    allTrendingRef: RefObject<HTMLHeadingElement | null>;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    showScrollIndicator: boolean;
    isHoveringScrollIndicator: boolean;
    onScrollIndicatorHoverChange: (hovering: boolean) => void;
    onScrollIndicatorClick: () => void;
}

const TrendingContent: React.FC<TrendingContentProps> = ({
    activeTab,
    topThree,
    remaining,
    onItemClick,
    scrollContainerRef,
    allTrendingRef,
    onScroll,
    showScrollIndicator,
    isHoveringScrollIndicator,
    onScrollIndicatorHoverChange,
    onScrollIndicatorClick,
}) => {
    return (
        <div className="flex-1 relative flex flex-col min-h-0">
            {/* Scrollable Content - Hidden Scrollbar */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide"
                onScroll={onScroll}
            >
                {/* Top 3 Items - Different display based on tab */}
                {topThree.length > 0 && (
                    <>
                        {activeTab === 'tracks' ? (
                            /* Tracks: Show vertical grid of HeroCards */
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {topThree.map((item, index) => (
                                    <HeroCard
                                        key={item.id}
                                        item={item}
                                        rank={index + 1}
                                        onClick={() => onItemClick(item)}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Playlists/Albums: Show FeaturedBanner */
                            <FeaturedBanner
                                topItem={topThree[0]}
                                topThree={topThree}
                                onItemClick={onItemClick}
                            />
                        )}
                    </>
                )}

                {/* Scroll Indicator - Overlayed at Bottom of Banner */}
                <ScrollIndicator
                    show={showScrollIndicator && remaining.length > 0}
                    isHovering={isHoveringScrollIndicator}
                    onHoverChange={onScrollIndicatorHoverChange}
                    onScrollClick={onScrollIndicatorClick}
                />

                {/* Remaining Items - Rows */}
                {remaining.length > 0 && (
                    <div>
                        <h2 ref={allTrendingRef} className="text-lg font-bold text-[#D1D1D1] mb-4">
                            Rankings
                        </h2>
                        <div className="space-y-2">
                            {remaining.map((item, index) => (
                                <TrendingRow
                                    key={item.id}
                                    item={item}
                                    rank={index + 4}
                                    onClick={() => onItemClick(item)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingContent;
