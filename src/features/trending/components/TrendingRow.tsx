// TrendingRow - Compact row component for items 4+

import React from 'react';
import { motion } from 'framer-motion';
import type { TrendingItem } from '../types/trending';
import { Star, MessageCircle, Heart, Tag } from 'lucide-react';

interface TrendingRowProps {
    item: TrendingItem;
    rank: number;
    onClick?: () => void;
}

const TrendingRow: React.FC<TrendingRowProps> = ({ item, rank, onClick }) => {
    const [imgError, setImgError] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: (rank - 4) * 0.03 }}
            className="bg-[#1a1a1a] rounded-lg p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 hover:bg-[#696969]/20 transition-all cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-10 h-10 rounded-lg bg-[#FFD1D1]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FFD1D1] font-bold text-sm">#{rank}</span>
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#696969]/30 flex-shrink-0">
                    {item.imageUrl && !imgError ? (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : item.color ? (
                        <div className="w-full h-full" style={{ backgroundColor: item.color }} />
                    ) : (
                        <div className="w-full h-full bg-[#696969]/30" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[#D1D1D1] font-semibold text-sm truncate group-hover:text-[#FFD1D1] transition-colors">
                        {item.name || item.id}
                    </h4>
                    {item.artist && (
                        <p className="text-[#D1D1D1]/60 text-xs truncate">
                            {item.artist}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-[#D1D1D1]/60 flex-shrink-0">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#FFD1D1] text-[#FFD1D1]" />
                        <span className="text-[#D1D1D1] font-medium">{item.avgRating.toFixed(1)}</span>
                        <span className="text-[#D1D1D1]/50">({item.ratingCount})</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-[#FFD1D1]" />
                        <span>{item.commentCount || 0}</span>
                    </div>

                    {/* Favorites */}
                    <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#FFD1D1]" />
                        <span>{item.favoriteCount || 0}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TrendingRow;
