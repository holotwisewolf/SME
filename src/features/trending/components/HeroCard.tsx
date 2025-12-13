// HeroCard - Large card component for top 3 trending items

import React from 'react';
import { motion } from 'framer-motion';
import type { TrendingItem } from '../types/trending';
import { Star, MessageCircle, Heart, Tag } from 'lucide-react';

interface HeroCardProps {
    item: TrendingItem;
    rank: number;
}

const HeroCard: React.FC<HeroCardProps> = ({ item, rank }) => {
    // Gradient colors for top 3 ranks
    const getRankGradient = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-[#FFD1D1] to-[#FFB5B5]'; // Gold-ish pink
            case 2:
                return 'from-[#D1D1D1] to-[#B5B5B5]'; // Silver
            case 3:
                return 'from-[#FFE5CC] to-[#FFCCAA]'; // Bronze-ish
            default:
                return 'from-[#FFD1D1] to-[#FFB5B5]';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: rank * 0.1 }}
            className="bg-[#292929] rounded-2xl p-6 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FFD1D1]/10 cursor-pointer group"
        >
            <div className="flex flex-col h-full">
                {/* Rank Badge */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRankGradient(rank)} flex items-center justify-center shadow-lg`}>
                        <span className="text-black font-bold text-2xl">#{rank}</span>
                    </div>

                    {/* Type Badge */}
                    <span className="px-3 py-1 bg-[#696969]/50 text-[#D1D1D1]/70 text-xs rounded-full capitalize border border-[#D1D1D1]/10">
                        {item.type}
                    </span>
                </div>

                {/* Cover Image */}
                {item.imageUrl && (
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[#696969]/30">
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                {/* Title & Artist */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#D1D1D1] mb-1 line-clamp-2 group-hover:text-[#FFD1D1] transition-colors">
                        {item.name || item.id}
                    </h3>
                    {item.artist && (
                        <p className="text-[#D1D1D1]/60 text-sm">
                            {item.artist}
                        </p>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    {/* Rating */}
                    <div className="bg-[#696969]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 fill-[#FFD1D1] text-[#FFD1D1]" />
                            <span className="text-[#D1D1D1] font-bold text-lg">{item.avgRating.toFixed(1)}</span>
                        </div>
                        <p className="text-[#D1D1D1]/50 text-xs">{item.ratingCount} ratings</p>
                    </div>

                    {/* Comments */}
                    <div className="bg-[#696969]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-4 h-4 text-[#FFD1D1]" />
                            <span className="text-[#D1D1D1] font-bold text-lg">{item.commentCount}</span>
                        </div>
                        <p className="text-[#D1D1D1]/50 text-xs">comments</p>
                    </div>

                    {/* Favorites */}
                    {item.favoriteCount > 0 && (
                        <div className="bg-[#696969]/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-[#FFD1D1]" />
                                <span className="text-[#D1D1D1] font-bold text-lg">{item.favoriteCount}</span>
                            </div>
                            <p className="text-[#D1D1D1]/50 text-xs">favorites</p>
                        </div>
                    )}

                    {/* Tags */}
                    {item.tagCount > 0 && (
                        <div className="bg-[#696969]/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="w-4 h-4 text-[#FFD1D1]" />
                                <span className="text-[#D1D1D1] font-bold text-lg">{item.tagCount}</span>
                            </div>
                            <p className="text-[#D1D1D1]/50 text-xs">tags</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HeroCard;
