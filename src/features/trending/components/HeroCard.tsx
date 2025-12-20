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
    // Rank badge colors - matching FeaturedBanner
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return { text: 'text-red-500', bg: 'bg-red-500/10' }; // Red
            case 2:
                return { text: 'text-purple-500', bg: 'bg-purple-500/10' }; // Purple
            case 3:
                return { text: 'text-blue-500', bg: 'bg-blue-500/10' }; // Blue
            default:
                return { text: 'text-[#FFD1D1]', bg: 'bg-[#FFD1D1]/10' };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: rank * 0.1 }}
            className="bg-[#1a1a1a] rounded-xl p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,209,209,0.15)] cursor-pointer group"
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

                    {/* Glassmorphic Rank Badge - Overlaid on top-left */}
                    <div className="absolute top-2 left-2 z-10">
                        <div className={`flex items-center justify-center h-8 px-3 ${getRankColor(rank).bg} backdrop-blur-md rounded-xl transition-colors duration-300`}>
                            <span className={`${getRankColor(rank).text} font-bold text-sm`}>
                                #{rank}
                            </span>
                        </div>
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
                    <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#FFD1D1]" />
                        <span>{item.tagCount || 0}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HeroCard;
