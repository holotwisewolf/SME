// FeaturedBanner - Carousel banner showing featured playlist

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrendingItem } from '../types/trending';
import { Star, Music, Heart, MessageCircle, Tag } from 'lucide-react';
import { fetchPlaylistTracksWithDetails } from '../../playlist/services/playlist_services';
import { getAlbumTracks } from '../../spotify/services/spotify_services';

interface FeaturedBannerProps {
    topItem: TrendingItem;
    topThree: TrendingItem[];
    onItemClick: (item: TrendingItem) => void;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ topItem, topThree, onItemClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tracks, setTracks] = useState<any[]>([]);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const [resetKey, setResetKey] = useState(0); // Key to force timer reset
    const [imgError, setImgError] = useState(false);

    // Reset image error state when item changes
    useEffect(() => {
        setImgError(false);
    }, [currentIndex, topThree]);

    // Auto-rotate carousel every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % topThree.length);
        }, 10000); // Changed to 10 seconds
        return () => clearInterval(interval);
    }, [topThree.length, resetKey]); // Reset when resetKey changes

    const currentItem = topThree[currentIndex];

    // Fetch actual playlist tracks
    useEffect(() => {
        const fetchTracks = async () => {
            if (currentItem.type === 'playlist') {
                setLoadingTracks(true);
                try {
                    const playlistTracks = await fetchPlaylistTracksWithDetails(currentItem.id);
                    setTracks(playlistTracks || []);
                } catch (error) {
                    console.error('Error fetching playlist tracks:', error);
                    setTracks([]);
                } finally {
                    setLoadingTracks(false);
                }
            } else if (currentItem.type === 'album') {
                setLoadingTracks(true);
                try {
                    const data = await getAlbumTracks(currentItem.id);
                    // Map album tracks to the structure expected by the renderer
                    // Album tracks endpoint doesn't return images, use album's
                    const validTracks = data?.items?.map((track: any) => ({
                        details: {
                            name: track.name,
                            artists: track.artists,
                            duration_ms: track.duration_ms,
                            album: {
                                images: [{ url: currentItem.imageUrl }]
                            }
                        },
                        spotify_track_id: track.id
                    })) || [];
                    setTracks(validTracks);
                } catch (error) {
                    console.error('Error fetching album tracks:', error);
                    setTracks([]);
                } finally {
                    setLoadingTracks(false);
                }
            } else {
                // For other items, show mock data
                setTracks([
                    { details: { name: 'Top Track 1', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 200000 }, spotify_track_id: '1' },
                    { details: { name: 'Top Track 2', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 180000 }, spotify_track_id: '2' },
                    { details: { name: 'Top Track 3', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 240000 }, spotify_track_id: '3' }
                ]);
            }
        };

        fetchTracks();
    }, [currentItem.id, currentItem.type]);

    // Format duration from ms to mm:ss
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Format large numbers (1000+ → 1k+)
    const formatCount = (count: number) => {
        if (count >= 1000) {
            return `${Math.floor(count / 1000)}k+`;
        }
        return count.toString();
    };

    // Get rank badge color
    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1: return { text: 'text-red-500', bg: 'bg-red-500/10' }; // Red
            case 2: return { text: 'text-purple-500', bg: 'bg-purple-500/10' }; // Purple
            case 3: return { text: 'text-blue-500', bg: 'bg-blue-500/10' }; // Blue
            default: return { text: 'text-[#FFD1D1]', bg: 'bg-[#FFD1D1]/10' };
        }
    };

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
                        <div className="flex">
                            {/* Left Column - Playlist Info */}
                            <div className="flex-shrink-0 w-64 bg-[#0a0a0a] p-4 flex flex-col">
                                {/* Title & Creator */}
                                <div className="mb-3">
                                    <h2 className="text-white font-bold text-base mb-1 line-clamp-1">
                                        {currentItem.name || currentItem.id}
                                    </h2>
                                    <p className="text-[#D1D1D1]/60 text-xs">
                                        Created by {currentItem.artist || 'Unknown'}
                                    </p>
                                </div>

                                {/* Image with Rank Badge */}
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#292929]/50 mb-3 group flex items-center justify-center">

                                    {currentItem.imageUrl && !imgError ? (
                                        <img
                                            src={currentItem.imageUrl}
                                            alt={currentItem.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : currentItem.color ? (
                                        <div
                                            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            style={{ backgroundColor: currentItem.color }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#292929]">
                                            <Music className="w-12 h-12 text-[#D1D1D1]/20" />
                                        </div>
                                    )}

                                    {/* Rank Badge Overlay - Top Left */}
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
                                <div className="flex items-center gap-3 text-xs text-[#D1D1D1]/60">
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
                            <div className="flex-1 p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D1D1D1]/10">
                                    <span className="text-[#D1D1D1]/60 text-sm"># Title</span>
                                    <span className="text-[#D1D1D1]/60 text-sm">Duration</span>
                                </div>

                                {/* Track List with Scrollbar */}
                                <div
                                    className="max-h-[200px] overflow-y-auto pr-2"
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

                                                    <span className="text-[#D1D1D1]/40 text-sm">
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

            {/* Carousel Dots - Below Banner */}
            <div className="flex justify-center gap-2 mt-3">
                {topThree.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            setResetKey(prev => prev + 1); // Reset the timer
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-[#FFD1D1] w-6'
                            : 'bg-[#D1D1D1]/30 hover:bg-[#D1D1D1]/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FeaturedBanner;
