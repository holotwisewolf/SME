import React from 'react';
import { Star, MessageCircle, Heart, Tag, Clock, Music, Activity, ListMusic, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
    id: string;
    type: 'rating' | 'comment' | 'favorite' | 'tag';
    created_at: string;
    value?: number;
    content?: string;

    // Support both casings for compatibility
    itemType?: string;
    item_type?: string;

    item_id?: string; // Fallback ID if not in track object

    user?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    track?: {
        id: string;
        title: string;
        artist: string;
        // Check for both ID formats
        artistId?: string;
        artist_id?: string;
        albumId?: string;
    };
}

interface ActivityCardProps {
    activity: ActivityItem;
    index: number;
    // Callbacks
    onTrackClick?: (id: string) => void;
    onArtistClick?: (idOrName: string) => void;
    onAlbumClick?: (id: string) => void;
    // [NEW] Added Prop
    onPlaylistClick?: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    index,
    onTrackClick,
    onArtistClick,
    onAlbumClick,
    onPlaylistClick
}) => {
    if (!activity) return null;

    // --- Safe Data Resolution ---
    const type = activity.itemType || activity.item_type || '';

    // Determine the ID: Use track.id if available, otherwise fallback to item_id
    const itemId = activity.track?.id || activity.item_id;

    // --- Helpers ---
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

    // --- Data Extraction ---
    const badge = getBadgeInfo();
    const displayName = activity.user?.display_name || 'Private User';
    const title = activity.track?.title || 'Unknown Title';
    const artistName = activity.track?.artist || 'Unknown Artist';

    const artistId = activity.track?.artistId || activity.track?.artist_id;

    // --- Click Handlers ---

    const handleArtistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (artistId) {
            onArtistClick?.(artistId);
        }
        else if (artistName) {
            onArtistClick?.(artistName);
        }
    };

    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        // [UPDATED] Robust Check for Playlist Type
        if (type === 'playlist' && itemId) {
            if (onPlaylistClick) {
                onPlaylistClick(itemId);
            } else {
                console.warn("onPlaylistClick prop is missing or undefined");
            }
            return;
        }

        // Existing Checks
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
                {/* --- LEFT ICON SECTION  --- */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#FFD1D1]/10 flex items-center justify-center border border-[#D1D1D1]/5">
                        {activity.type === 'rating' && <Star className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />}
                        {activity.type === 'comment' && <MessageCircle className="w-5 h-5 text-[#FFD1D1]" />}
                        {activity.type === 'favorite' && <Heart className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />}
                        {activity.type === 'tag' && <Tag className="w-5 h-5 text-[#FFD1D1]" />}
                        {!['rating', 'comment', 'favorite', 'tag'].includes(activity.type) && <Activity className="w-5 h-5 text-[#FFD1D1]" />}
                    </div>
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-1 mb-1 text-sm text-[#D1D1D1] leading-relaxed">

                        <span className="font-semibold text-[#FFD1D1] hover:underline cursor-pointer">
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

                        {/* --- CONDITIONAL ARTIST RENDERING --- */}
                        {type === 'playlist' ? (
                            <span className="font-medium text-[#D1D1D1]">
                                {artistName}
                            </span>
                        ) : (
                            <button
                                onClick={handleArtistClick}
                                disabled={!artistId && !artistName}
                                className="font-medium text-[#D1D1D1] hover:text-white hover:underline transition-colors cursor-pointer"
                            >
                                {artistName}
                            </button>
                        )}
                        {/* ------------------------------------ */}

                        <div className="flex items-center gap-1 text-xs text-[#D1D1D1]/40 flex-shrink-0 whitespace-nowrap ml-auto">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(activity.created_at)}
                        </div>
                    </div>

                    {/* Comment Content */}
                    {activity.content && (
                        <p className="text-sm text-[#D1D1D1]/70 italic mt-2 line-clamp-2 pl-3 border-l-2 border-[#D1D1D1]/10">
                            "{activity.content}"
                        </p>
                    )}

                    {/* Star Rating Display */}
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

                    {/* Bottom Badge (Music/Playlist/Album) */}
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