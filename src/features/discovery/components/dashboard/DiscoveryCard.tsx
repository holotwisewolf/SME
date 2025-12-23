// DiscoveryCard - Display individual discovery items

import React from 'react';
import { motion } from 'framer-motion';
import type { DiscoveryItem } from '../../types/discovery';
import { Star, MessageCircle, Tag, Heart } from 'lucide-react';

interface DiscoveryCardProps {
    item: DiscoveryItem;
    rank: number;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ item, rank }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: rank * 0.05 }}
            className="bg-[#292929] rounded-xl p-4 hover:bg-[#696969]/30 transition-all cursor-pointer group border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 shadow-sm hover:shadow-lg hover:shadow-[#FFD1D1]/10"
        >
            {/* Rank Badge */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#FFD1D1] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-black font-bold text-lg">#{rank}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-[#D1D1D1] font-semibold text-base truncate group-hover:text-[#FFD1D1] transition-colors">
                        {item.name || item.id}
                    </h3>

                    {/* Artist (for tracks/albums) */}
                    {item.artist && (
                        <p className="text-[#D1D1D1]/60 text-sm truncate mt-0.5">
                            {item.artist}
                        </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#D1D1D1]/60">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#FFD1D1] text-[#FFD1D1]" />
                            <span className="text-[#D1D1D1] font-medium">{item.avgRating.toFixed(1)}</span>
                            <span>({item.ratingCount})</span>
                        </div>

                        {/* Comments */}
                        {item.commentCount > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-[#FFD1D1]" />
                                <span>{item.commentCount}</span>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#FFD1D1]" />
                            <span>{item.tagCount || 0}</span>
                        </div>

                        {/* Favorites */}
                        <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-[#FFD1D1]" />
                            <span>{item.favoriteCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0">
                    <span className="px-2 py-1 bg-[#696969]/50 text-[#D1D1D1]/70 text-xs rounded-full capitalize border border-[#D1D1D1]/10">
                        {item.type}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscoveryCard;
