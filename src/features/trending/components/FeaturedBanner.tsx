import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Music, Heart, MessageCircle, Tag } from 'lucide-react';
import type { TrendingItem } from '../types/trending';
import { useFeaturedBanner } from '../hooks/useFeaturedBanner';

interface FeaturedBannerProps {
    topThree: TrendingItem[];
    onItemClick: (item: TrendingItem) => void;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ topThree, onItemClick }) => {
    const {
        currentIndex,
        tracks,
        loadingTracks,
        imgError, setImgError,
        currentItem,
        creatorName,
        displayImage,
        formatDuration,
        formatCount,
        getRankBadgeColor,
        handleDotClick
    } = useFeaturedBanner(topThree);

    if (!currentItem) return null;

    return (
        <div className="mb-6">
            <div
                className="relative bg-[#1a1a1a] rounded-xl border border-[#D1D1D1]/10 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_0_10px_rgba(255,209,209,0.1)] hover:border-[white]/20"
                onClick={() => onItemClick(currentItem)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Left Column - Playlist Info */}
                            <div className="flex-shrink-0 w-full md:w-64 bg-[#0a0a0a] p-4 flex flex-col">
                                {/* Title & Creator */}
                                <div className="mb-3">
                                    <h2 className="text-white font-bold text-base mb-1 line-clamp-1">
                                        {currentItem.name || currentItem.id}
                                    </h2>
                                    <p className="text-[#D1D1D1]/60 text-xs">
                                        Created by {creatorName || 'Unknown'}
                                    </p>
                                </div>

                                {/* Image with Rank Badge */}
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#292929]/50 mb-3 group flex items-center justify-center">
                                    {displayImage && !imgError ? (
                                        <img
                                            src={displayImage}
                                            alt={currentItem.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: currentItem.color || '#292929' }}
                                        >
                                            <Music className="w-12 h-12 text-[#D1D1D1]/20" />
                                        </div>
                                    )}

                                    {/* Rank Badge Overlay */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className={`flex items-center justify-center h-8 px-3 ${getRankBadgeColor(currentIndex + 1).bg} backdrop-blur-md rounded-xl transition-colors duration-300`}>
                                            <span className={`${getRankBadgeColor(currentIndex + 1).text} font-bold text-sm`}>
                                                #{currentIndex + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 ${star <= Math.round(currentItem.avgRating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-[#D1D1D1]/20 fill-none'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-white text-sm font-semibold">
                                            {currentItem.avgRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-[#D1D1D1]/60 text-xs uppercase tracking-wide">
                                        Rated by {formatCount(currentItem.ratingCount)} {currentItem.ratingCount === 1 ? 'user' : 'users'}
                                    </p>
                                </div>

                                {/* Stats Footer */}
                                <div className="flex items-center gap-3 text-xs text-[#D1D1D1]/60 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>{currentItem.favoriteCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5" />
                                        <span>{currentItem.tagCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>{currentItem.commentCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Tracks */}
                            <div className="flex-1 p-4 bg-[#1a1a1a]">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D1D1D1]/10">
                                    <span className="text-[#D1D1D1]/60 text-sm"># Title</span>
                                    <span className="text-[#D1D1D1]/60 text-sm">Duration</span>
                                </div>

                                <div
                                    className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar"
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#3a3a3a #1a1a1a'
                                    }}
                                >
                                    {loadingTracks ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="w-6 h-6 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : tracks.length > 0 ? (
                                        <div className="space-y-1">
                                            {tracks.map((track, index) => (
                                                <div
                                                    key={track.spotify_track_id || index}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#292929]/30 transition-colors group"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="text-[#D1D1D1]/40 text-sm w-5 text-center">
                                                        {index + 1}
                                                    </span>

                                                    {/* Track Thumbnail */}
                                                    <div className="w-10 h-10 rounded overflow-hidden bg-[#292929]/50 flex-shrink-0">
                                                        {track.details?.album?.images?.[0]?.url ? (
                                                            <img
                                                                src={track.details.album.images[0].url}
                                                                alt={track.details.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Music className="w-5 h-5 text-[#D1D1D1]/20" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[#D1D1D1] text-sm font-medium truncate group-hover:text-white transition-colors">
                                                            {track.details?.name || 'Unknown Track'}
                                                        </p>
                                                        <p className="text-[#D1D1D1]/60 text-xs truncate">
                                                            {track.details?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                                                        </p>
                                                    </div>

                                                    <span className="text-[#D1D1D1]/40 text-sm whitespace-nowrap">
                                                        {track.details?.duration_ms ? formatDuration(track.details.duration_ms) : '--:--'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-32 text-[#D1D1D1]/40 text-sm">
                                            No tracks available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-3">
                {topThree.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-[#FFD1D1] w-6'
                            : 'bg-[#D1D1D1]/30 hover:bg-[#D1D1D1]/50'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturedBanner;