// HeroCard - Large card component for top 3 trending items (REDESIGNED)

import React from 'react';
import { motion } from 'framer-motion';
import type { TrendingItem } from '../types/trending';
import { Star, MessageCircle, Heart, Tag } from 'lucide-react';

interface HeroCardProps {
    item: TrendingItem;
    rank: number;
    onClick?: () => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ item, rank, onClick }) => {
    // Rank badge colors
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-[#FFD700]/90'; // Gold
            case 2:
                return 'bg-[#C0C0C0]/90'; // Silver
            case 3:
                return 'bg-[#CD7F32]/90'; // Bronze
            default:
                return 'bg-[#FFD1D1]/90';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: rank * 0.1 }}
            className="bg-[#292929] rounded-xl p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FFD1D1]/10 cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex flex-col h-full">
                {/* Cover Image with Rank Badge Overlay */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-[#696969]/30">
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    )}

                    {/* Small Rank Badge - Overlaid on top-left */}
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-md ${getRankColor(rank)} flex items-center justify-center shadow-lg backdrop-blur-sm`}>
                        <span className="text-black font-bold text-sm">#{rank}</span>
                    </div>
                </div>

                {/* Title & Artist */}
                <div className="mb-3">
                    <h3 className="text-base font-bold text-[#D1D1D1] mb-1 line-clamp-2 group-hover:text-[#FFD1D1] transition-colors">
                        {item.name || item.id}
                    </h3>
                    {item.artist && (
                        <p className="text-[#D1D1D1]/60 text-sm line-clamp-1">
                            {item.artist}
                        </p>
                    )}
                </div>

                {/* Inline Stats Row */}
                <div className="flex items-center gap-3 text-xs text-[#D1D1D1]/70 flex-wrap mt-auto">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#FFD1D1] text-[#FFD1D1]" />
                        <span className="font-semibold text-[#D1D1D1]">{item.avgRating.toFixed(1)}</span>
                        <span className="text-[#D1D1D1]/50">({item.ratingCount})</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-[#FFD1D1]" />
                        <span>{item.commentCount}</span>
                    </div>

                    {/* Favorites */}
                    <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#FFD1D1]" />
                        <span>{item.favoriteCount}</span>
                    </div>

                    {/* Tags */}
                    {item.tagCount > 0 && (
                        <div className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#FFD1D1]" />
                            <span>{item.tagCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HeroCard;
