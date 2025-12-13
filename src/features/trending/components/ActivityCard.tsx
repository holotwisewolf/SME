// ActivityCard - Individual activity item in the feed

import React from 'react';
import { Star, MessageCircle, Heart, Tag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityCardProps {
    activity: {
        id: string;
        type: 'rating' | 'comment' | 'favorite' | 'tag';
        user: string;
        itemId: string;
        itemType: string;
        itemName?: string;
        value?: number;
        preview?: string;
        timestamp: string;
    };
    index: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index }) => {
    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const getIcon = () => {
        switch (activity.type) {
            case 'rating':
                return <Star className="w-5 h-5 fill-[#FFD1D1] text-[#FFD1D1]" />;
            case 'comment':
                return <MessageCircle className="w-5 h-5 text-[#FFD1D1]" />;
            case 'favorite':
                return <Heart className="w-5 h-5 text-[#FFD1D1]" />;
            case 'tag':
                return <Tag className="w-5 h-5 text-[#FFD1D1]" />;
        }
    };

    const getActionText = () => {
        switch (activity.type) {
            case 'rating':
                return 'rated';
            case 'comment':
                return 'commented on';
            case 'favorite':
                return 'favorited';
            case 'tag':
                return 'tagged';
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
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#FFD1D1]/10 flex items-center justify-center flex-shrink-0">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm text-[#D1D1D1]">
                            <span className="font-semibold text-[#FFD1D1]">@{activity.user}</span>
                            {' '}{getActionText()}{' '}
                            <span className="font-medium">{activity.itemName || activity.itemId}</span>
                            {activity.type === 'rating' && activity.value && (
                                <span className="ml-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`inline w-3 h-3 ${i < activity.value! ? 'fill-[#FFD1D1] text-[#FFD1D1]' : 'text-[#D1D1D1]/30'
                                                }`}
                                        />
                                    ))}
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-[#D1D1D1]/50 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(activity.timestamp)}
                        </div>
                    </div>

                    {/* Preview */}
                    {activity.preview && (
                        <p className="text-sm text-[#D1D1D1]/70 italic mt-2 line-clamp-2">
                            "{activity.preview}"
                        </p>
                    )}

                    {/* Type Badge */}
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#696969]/30 text-[#D1D1D1]/60 text-xs rounded-full capitalize">
                        {activity.itemType}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityCard;
