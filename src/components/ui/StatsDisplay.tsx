// StatsDisplay - Reusable stats display component

import React from 'react';
import { Star, MessageCircle, Heart, Tag } from 'lucide-react';

interface StatsDisplayProps {
    avgRating: number;
    ratingCount: number;
    commentCount: number;
    favoriteCount: number;
    tagCount?: number;
    variant?: 'inline' | 'stacked';
    size?: 'sm' | 'md' | 'lg';
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
    avgRating,
    ratingCount,
    commentCount,
    favoriteCount,
    tagCount,
    variant = 'inline',
    size = 'md',
}) => {
    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4',
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
    };

    const iconSize = iconSizes[size];
    const textSize = textSizes[size];

    const stats = (
        <>
            {/* Rating */}
            <div className="flex items-center gap-1">
                <Star className={`${iconSize} fill-[#FFD1D1] text-[#FFD1D1]`} />
                <span className={`font-semibold text-[#D1D1D1] ${textSize}`}>{avgRating.toFixed(1)}</span>
                <span className={`text-[#D1D1D1]/50 ${textSize}`}>({ratingCount})</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1">
                <MessageCircle className={`${iconSize} text-[#FFD1D1]`} />
                <span className={textSize}>{commentCount}</span>
            </div>

            {/* Favorites */}
            <div className="flex items-center gap-1">
                <Heart className={`${iconSize} text-[#FFD1D1]`} />
                <span className={textSize}>{favoriteCount}</span>
            </div>

            {/* Tags */}
            {tagCount !== undefined && tagCount > 0 && (
                <div className="flex items-center gap-1">
                    <Tag className={`${iconSize} text-[#FFD1D1]`} />
                    <span className={textSize}>{tagCount}</span>
                </div>
            )}
        </>
    );

    if (variant === 'stacked') {
        return <div className="flex flex-col gap-2 text-[#D1D1D1]/70">{stats}</div>;
    }

    return <div className="flex items-center gap-3 text-[#D1D1D1]/70 flex-wrap">{stats}</div>;
};

export default StatsDisplay;
