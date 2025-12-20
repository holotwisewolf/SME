import React from 'react';
import { Star, MessageCircle, Heart, Tag, Clock, Music, Activity, ListMusic, Disc } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActivityCard, type ActivityItem } from '../hooks/useActivityCard';

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
    const {
        type,
        displayName,
        title,
        artistName,
        resolvedRightId,
        getRelativeTime,
        getActionText,
        handleLeftNameClick,
        handleRightNameClick,
        handleTitleClick
    } = useActivityCard({
        activity,
        onTrackClick,
        onArtistClick,
        onAlbumClick,
        onPlaylistClick,
        onUserClick
    });

    if (!activity) return null;

    const getBadgeInfo = () => {
        if (type === 'playlist') return { text: 'PLAYLIST', icon: <ListMusic className="w-3 h-3 text-[#FFD1D1]" /> };
        if (type === 'album') return { text: 'ALBUM', icon: <Disc className="w-3 h-3 text-[#FFD1D1]" /> };
        return { text: 'TRACK', icon: <Music className="w-3 h-3 text-[#FFD1D1]" /> };
    };

    const badge = getBadgeInfo();

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
                            className="font-semibold text-[#D1D1D1] hover:underline transition-colors cursor-pointer disabled:text-[#D1D1D1]/50 disabled:no-underline disabled:cursor-default"
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

                    {activity.type === 'tag' && activity.tag_name && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFD1D1]/10 border border-[#FFD1D1]/20">
                            <Tag className="w-3 h-3 text-[#FFD1D1]" />
                            <span className="text-xs font-medium text-[#FFD1D1]">#{activity.tag_name}</span>
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