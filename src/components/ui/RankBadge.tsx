// RankBadge - Reusable rank badge component

import React from 'react';

interface RankBadgeProps {
    rank: number;
    size?: 'sm' | 'md' | 'lg';
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md' }) => {
    // Rank badge colors
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return { text: 'text-red-500', bg: 'bg-red-500/10' };
            case 2:
                return { text: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 3:
                return { text: 'text-blue-500', bg: 'bg-blue-500/10' };
            default:
                return { text: 'text-[#FFD1D1]', bg: 'bg-[#FFD1D1]/10' };
        }
    };

    const sizes = {
        sm: 'h-6 px-2 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
    };

    const { text, bg } = getRankColor(rank);
    const sizeClasses = sizes[size];

    return (
        <div className={`flex items-center justify-center ${sizeClasses} ${bg} backdrop-blur-md rounded-xl transition-colors duration-300`}>
            <span className={`${text} font-bold`}>
                #{rank}
            </span>
        </div>
    );
};

export default RankBadge;
