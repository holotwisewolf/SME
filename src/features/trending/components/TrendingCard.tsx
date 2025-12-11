// TrendingCard - Display individual trending items

import React from 'react';
import { motion } from 'framer-motion';
import type { TrendingItem } from '../types/trending';
import { Star, MessageCircle, Tag, Heart } from 'lucide-react';

interface TrendingCardProps {
    item: TrendingItem;
    rank: number;
}

const TrendingCard: React.FC<TrendingCardProps> = ({ item, rank }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: rank * 0.05 }}
            className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#252525] transition-all cursor-pointer group"
        >
            {/* Rank Badge */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FFD1D1] to-[#BAFFB5] rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">#{rank}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-base truncate group-hover:text-[#FFD1D1] transition-colors">
                        {item.name || item.id}
                    </h3>

                    {/* Artist (for tracks/albums) */}
                    {item.artist && (
                        <p className="text-gray-400 text-sm truncate mt-0.5">
                            {item.artist}
                        </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-white font-medium">{item.avgRating.toFixed(1)}</span>
                            <span>({item.ratingCount})</span>
                        </div>

                        {/* Comments */}
                        {item.commentCount > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{item.commentCount}</span>
                            </div>
                        )}

                        {/* Tags */}
                        {item.tagCount > 0 && (
                            <div className="flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{item.tagCount}</span>
                            </div>
                        )}

                        {/* Favorites */}
                        {item.favoriteCount > 0 && (
                            <div className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{item.favoriteCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0">
                    <span className="px-2 py-1 bg-[#292929] text-gray-400 text-xs rounded-full capitalize">
                        {item.type}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default TrendingCard;
