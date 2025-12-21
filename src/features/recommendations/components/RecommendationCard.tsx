// RecommendationCard - displays a single recommended item with match score

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Play, Pause } from 'lucide-react';
import type { RecommendedItem } from '../types/recommendation_types';
import { useTrackPreview } from '../../spotify/hooks/useTrackPreview';

interface RecommendationCardProps {
    item: RecommendedItem;
    index: number;
    onAddToFavourites?: (item: RecommendedItem) => void;
    onAddToPlaylist?: (item: RecommendedItem) => void;
    onClick?: (item: RecommendedItem) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
    item,
    index,
    onAddToFavourites,
    onAddToPlaylist,
    onClick
}) => {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { playPreview, stopPreview, currentTrackId } = useTrackPreview();

    const isCurrentlyPlaying = currentTrackId === item.id;

    // Get match score color based on percentage
    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-400 bg-green-400/20';
        if (percentage >= 60) return 'text-yellow-400 bg-yellow-400/20';
        if (percentage >= 40) return 'text-orange-400 bg-orange-400/20';
        return 'text-[#FFD1D1] bg-[#FFD1D1]/20';
    };

    // Get primary reason for recommendation
    const getPrimaryReason = () => {
        if (item.reasons.length === 0) return null;
        return item.reasons.sort((a, b) => b.contribution - a.contribution)[0];
    };

    const primaryReason = getPrimaryReason();

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCurrentlyPlaying) {
            stopPreview();
        } else if (item.previewUrl) {
            playPreview(item.previewUrl, item.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative bg-[#1a1a1a] rounded-xl p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 hover:bg-[#292929] transition-all cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(item)}
        >
            {/* Match Score Badge - Top Right */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${getMatchColor(item.matchPercentage)}`}>
                {item.matchPercentage}% Match
            </div>

            {/* Cover Image */}
            <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-[#292929]">
                {!imgError && item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFD1D1]/30 to-[#696969]/30">
                        <span className="text-4xl">🎵</span>
                    </div>
                )}

                {/* Play Button Overlay */}
                {item.previewUrl && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isHovered || isCurrentlyPlaying ? 1 : 0, scale: isHovered || isCurrentlyPlaying ? 1 : 0.8 }}
                        className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-[#FFD1D1] text-[#1a1a1a] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        onClick={handlePlayClick}
                    >
                        {isCurrentlyPlaying ? (
                            <Pause className="w-5 h-5" fill="currentColor" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                        )}
                    </motion.button>
                )}

                {/* Quick Action Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute top-3 left-3 flex gap-2"
                >
                    <button
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#FFD1D1] hover:text-[#1a1a1a] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToFavourites?.(item);
                        }}
                        title="Add to Favorites"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#FFD1D1] hover:text-[#1a1a1a] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToPlaylist?.(item);
                        }}
                        title="Add to Playlist"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            {/* Item Info */}
            <div className="space-y-1">
                <h3 className="text-[#D1D1D1] font-semibold text-sm truncate group-hover:text-[#FFD1D1] transition-colors">
                    {item.name}
                </h3>
                <p className="text-[#D1D1D1]/60 text-xs truncate">
                    {item.artist}
                </p>
            </div>

            {/* Why Recommended */}
            {primaryReason && (
                <div className="mt-3 pt-3 border-t border-[#D1D1D1]/10">
                    <p className="text-[#FFD1D1]/70 text-xs truncate">
                        {primaryReason.label}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default RecommendationCard;
