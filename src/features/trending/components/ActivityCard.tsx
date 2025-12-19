import React from 'react';
import { Star, MessageCircle, Heart, Tag, Clock, Music, Activity, ListMusic, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
    id: string;
    type: 'rating' | 'comment' | 'favorite' | 'tag';
    created_at: string;
    value?: number;
    content?: string;
    
    itemType?: string; 
    item_type?: string; 
    item_id?: string; 
    
    user?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    track?: {
        id: string;
        title: string;
        artist: string;
        artistId?: string; 
        artist_id?: string;
        user_id?: string; // This is the creator ID for playlists
        albumId?: string;
    };
}

interface ActivityCardProps {
    activity: ActivityItem;
    index: number;
    onTrackClick?: (id: string) => void;
    onArtistClick?: (idOrName: string) => void;
    onAlbumClick?: (id: string) => void;
    onPlaylistClick?: (id: string) => void;
    onUserClick?: (userId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
    activity, 
    index, 
    onTrackClick, 
    onArtistClick, 
    onAlbumClick,
    onPlaylistClick,
    onUserClick 
}) => {
    if (!activity) return null;

    // Resolve activity type and ensure lowercase for matching
    const type = (activity.itemType || activity.item_type || activity.type || '').toLowerCase();
    const itemId = activity.track?.id || activity.item_id;

    const getBadgeInfo = () => {
        if (type === 'playlist') return { text: 'PLAYLIST', icon: <ListMusic className="w-3 h-3 text-[#FFD1D1]" /> };
        if (type === 'album') return { text: 'ALBUM', icon: <Disc className="w-3 h-3 text-[#FFD1D1]" /> };
        return { text: 'TRACK', icon: <Music className="w-3 h-3 text-[#FFD1D1]" /> };
    };

    const getRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const getActionText = () => {
        switch (activity.type) {
            case 'rating': return 'rated';
            case 'comment': return 'commented on';
            case 'favorite': return 'favourited';
            case 'tag': return 'tagged';
            default: return 'interacted with';
        }
    };

    const badge = getBadgeInfo();
    const displayName = activity.user?.display_name || 'Anonymous';
    const title = activity.track?.title || 'Unknown Title';
    const artistName = activity.track?.artist || 'Unknown Artist';
    
    // Use user_id for playlists and artistId for tracks
    const resolvedRightId = type === 'playlist' 
        ? activity.track?.user_id 
        : (activity.track?.artistId || activity.track?.artist_id);

    // Left side click: User who performed the action
    const handleLeftNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activity.user?.id && onUserClick) {
            onUserClick(activity.user.id);
        }
    };

    // Right side click: Playlist Creator OR Spotify Artist
    const handleRightNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (type === 'playlist') {
            if (resolvedRightId && onUserClick) {
                onUserClick(resolvedRightId);
            } else {
                console.warn("Missing Creator User ID for playlist activity:", activity);
            }
        } else {
            if (resolvedRightId) {
                onArtistClick?.(resolvedRightId);
            } else if (artistName) {
                onArtistClick?.(artistName);
            }
        }
    };

    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'playlist' && itemId) {
            onPlaylistClick?.(itemId);
            return;
        }
        if (type === 'album' && (itemId || activity.track?.albumId)) {
            onAlbumClick?.(itemId || activity.track?.albumId!);
        } else if (itemId) {
            onTrackClick?.(itemId);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-[#292929] rounded-lg p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 transition-all cursor-pointer group"
        >
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#FFD1D1]/10 flex items-center justify-center border border-[#D1D1D1]/5">
                        {activity.type === 'rating' && <Star className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />}
                        {activity.type === 'comment' && <MessageCircle className="w-5 h-5 text-[#FFD1D1]" />}
                        {activity.type === 'favorite' && <Heart className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />}
                        {activity.type === 'tag' && <Tag className="w-5 h-5 text-[#FFD1D1]" />}
                        {!['rating', 'comment', 'favorite', 'tag'].includes(activity.type) && <Activity className="w-5 h-5 text-[#FFD1D1]" />}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-1 mb-1 text-sm text-[#D1D1D1] leading-relaxed">
                        <span 
                            onClick={handleLeftNameClick}
                            className="font-semibold text-[#FFD1D1] hover:underline cursor-pointer"
                        >
                            {displayName}
                        </span>

                        <span>{getActionText()}</span>
                        
                        <button 
                            onClick={handleTitleClick}
                            className="font-bold text-white hover:text-[#FFD1D1] hover:underline transition-colors text-left"
                        >
                            {title}
                        </button>
                        
                        <span className="text-[#D1D1D1]/50">by</span>

                        <button 
                            onClick={handleRightNameClick}
                            disabled={!resolvedRightId && !artistName} 
                            className="font-semibold text-[#D1D1D1] hover: transition-colors cursor-pointer disabled:text-[#D1D1D1]/50 disabled:no-underline"
                        >
                            {artistName}
                        </button>

                        <div className="flex items-center gap-1 text-xs text-[#D1D1D1]/40 flex-shrink-0 whitespace-nowrap ml-auto">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(activity.created_at)}
                        </div>
                    </div>

                    {activity.content && (
                        <p className="text-sm text-[#D1D1D1]/70 italic mt-2 line-clamp-2 pl-3 border-l-2 border-[#D1D1D1]/10">
                            "{activity.content}"
                        </p>
                    )}

                    {activity.type === 'rating' && activity.value && (
                        <div className="mt-2 flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 mr-0.5 ${i < (activity.value || 0) ? 'fill-[#FFD1D1] text-[#FFD1D1]' : 'text-[#D1D1D1]/20'}`}
                                />
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FFD1D1]/5 border border-[#FFD1D1]/10 w-fit">
                        {badge.icon}
                        <span className="text-[10px] font-semibold text-[#FFD1D1] tracking-wider uppercase">
                            {badge.text}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityCard;