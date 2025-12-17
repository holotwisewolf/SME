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
    
    user?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    track?: {
        id: string;
        title: string;
        artist: string;
    };
}

interface ActivityCardProps {
    activity: ActivityItem;
    index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
    if (!activity) return null;
    
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

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getActionText = () => {
        switch (activity.type) {
            case 'rating': return 'rated';
            case 'comment': return 'commented on';
            case 'favorite': return 'favorited';
            case 'tag': return 'tagged';
            default: return 'interacted with';
        }
    };

    const getBadgeInfo = () => {
        if (activity.itemType === 'playlist') {
            return { text: 'PLAYLIST', icon: <ListMusic className="w-3 h-3 text-[#FFD1D1]" /> };
        }
        if (activity.itemType === 'album') {
            return { text: 'ALBUM', icon: <Disc className="w-3 h-3 text-[#FFD1D1]" /> };
        }
        return { text: 'MUSIC', icon: <Music className="w-3 h-3 text-[#FFD1D1]" /> };
    };

    const badge = getBadgeInfo();
    const displayName = activity.user?.display_name || 'Anonymous';
    const avatarUrl = activity.user?.avatar_url;
    const title = activity.track?.title || 'Unknown Title';
    const artist = activity.track?.artist || 'Unknown Artist';

    // DEBUG: Log ONLY if the title is missing so we don't spam the console
if (!activity.track?.title) {
    console.warn('⚠️ Found broken activity:', {
        id: activity.id,
        type: activity.type,
        fullObject: activity
    });
}

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-[#292929] rounded-lg p-4 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30 transition-all cursor-pointer group"
        >
            <div className="flex gap-4">
                {/* --- LEFT ICON SECTION --- */}
                <div className="flex-shrink-0">
                    {/* LOGIC:
                       1. If it is a RATING -> Force display of the STAR icon (Ignore user avatar).
                       2. If it is NOT a rating (e.g. Comment) -> Show Avatar if exists, else Default Icon.
                    */}
                    {activity.type === 'rating' ? (
                        <div className="w-10 h-10 rounded-full bg-[#FFD1D1]/10 flex items-center justify-center">
                            <Star className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />
                        </div>
                    ) : (
                        avatarUrl ? (
                            <img 
                                src={avatarUrl} 
                                alt={displayName} 
                                className="w-10 h-10 rounded-full object-cover border border-[#D1D1D1]/10"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#FFD1D1]/10 flex items-center justify-center">
                                {activity.type === 'comment' ? (
                                    <MessageCircle className="w-5 h-5 text-[#FFD1D1]" />
                                ) : activity.type === 'favorite' ? (
                                    <Heart className="w-5 h-5 text-[#FFD1D1]" />
                                ) : (
                                    <Activity className="w-5 h-5 text-[#FFD1D1]" />
                                )}
                            </div>
                        )
                    )}
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm text-[#D1D1D1] leading-relaxed">
                            <span className="font-semibold text-[#FFD1D1] hover:underline cursor-pointer">
                                {displayName}
                            </span>
                            {' '}{getActionText()}{' '}
                            
                            <span className="font-medium text-white">
                                {title}
                            </span>
                            
                            <span className="text-[#D1D1D1]/50 ml-1">
                                by {artist}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[#D1D1D1]/40 flex-shrink-0 whitespace-nowrap mt-1">
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