// DiscoverySidebar - Right sidebar with community insights (ENHANCED)

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity, Star, MessageCircle, Heart, Tag, ExternalLink } from 'lucide-react';
import { getTrendingTags, getRecentActivity, getCommunityQuickStats } from '../services/trending_services';

const DiscoverySidebar: React.FC = () => {
    const [trendingTags, setTrendingTags] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalItems: 0, activeUsers: 0, thisWeek: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSidebarData();
    }, []);

    const fetchSidebarData = async () => {
        setLoading(true);
        try {
            const [tags, activity, quickStats] = await Promise.all([
                getTrendingTags('week', 10),
                getRecentActivity(5), // Fewer items for compact display
                getCommunityQuickStats()
            ]);

            setTrendingTags(tags);
            setRecentActivity(activity);
            setStats(quickStats);
        } catch (error) {
            console.error('Error fetching sidebar data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const getActivityIcon = (type: string) => {
        const iconClass = "w-3.5 h-3.5";
        switch (type) {
            case 'rating': return <Star className={`${iconClass} text-[#FFD1D1] fill-[#FFD1D1]`} />;
            case 'comment': return <MessageCircle className={`${iconClass} text-[#FFD1D1]`} />;
            case 'favorite': return <Heart className={`${iconClass} text-[#FFD1D1] fill-[#FFD1D1]`} />;
            case 'tag': return <Tag className={`${iconClass} text-[#FFD1D1]`} />;
            default: return <span className="text-[#D1D1D1]/50">•</span>;
        }
    };

    const getActivityText = (activity: any) => {
        switch (activity.type) {
            case 'rating':
                return `rated ${activity.itemType}`;
            case 'comment':
                return `commented on ${activity.itemType}`;
            case 'favorite':
                return `favorited ${activity.itemType}`;
            case 'tag':
                return `tagged ${activity.itemType}`;
            default:
                return `interacted with ${activity.itemType}`;
        }
    };

    return (
        <div className="w-80 flex-shrink-0 space-y-4 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
            {/* Trending Tags - Compact */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#FFD1D1]" />
                    <h3 className="text-sm font-bold text-[#D1D1D1]">Trending Tags</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-16">
                        <div className="w-4 h-4 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : trendingTags.length > 0 ? (
                    <>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {trendingTags.map((tag) => (
                                <button
                                    key={tag.name}
                                    className="px-2 py-1 bg-[#696969]/30 hover:bg-[#FFD1D1]/20 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/40 rounded-full text-xs text-[#D1D1D1] transition-all duration-200 cursor-pointer"
                                    title="Click to filter"
                                >
                                    #{tag.name} ({tag.count})
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#D1D1D1]/40 mt-2">
                            Click a tag to filter results
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-[#D1D1D1]/50">No trending tags yet</p>
                )}
            </div>

            {/* Community Pulse - Enhanced */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#FFD1D1]" />
                        <h3 className="text-sm font-bold text-[#D1D1D1]">Community Pulse</h3>
                    </div>
                    <a
                        href="/discovery/community-activity"
                        className="text-[#D1D1D1]/60 hover:text-[#FFD1D1] transition-colors"
                        title="View full activity"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-16">
                        <div className="w-4 h-4 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentActivity.length > 0 ? (
                    <>
                        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#D1D1D1]/5">
                            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="text-xs border-b border-[#D1D1D1]/5 pb-2 last:border-0">
                                        <p className="text-[#D1D1D1]/80 flex items-center gap-1.5">
                                            {getActivityIcon(activity.type)}
                                            <span className="text-[#FFD1D1] font-medium">@{activity.user}</span>
                                            {' '}
                                            <span className="text-[#D1D1D1]/60">{getActivityText(activity)}</span>
                                        </p>
                                        {activity.preview && (
                                            <p className="text-[#D1D1D1]/50 italic mt-1 line-clamp-1">"{activity.preview}"</p>
                                        )}
                                        <p className="text-[#D1D1D1]/40 mt-1">{getRelativeTime(activity.timestamp)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-[#D1D1D1]/40 mt-2">
                            Real-time community activity
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-[#D1D1D1]/50">No recent activity</p>
                )}
            </div>

            {/* Quick Stats - Improved Labels */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[#FFD1D1]" />
                    <h3 className="text-sm font-bold text-[#D1D1D1]">Quick Stats</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-16">
                        <div className="w-4 h-4 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#D1D1D1]/60">Trending Items</span>
                            <span className="text-sm font-bold text-[#FFD1D1]">{stats.totalItems.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#D1D1D1]/60">Active Members</span>
                            <span className="text-sm font-bold text-[#FFD1D1]">{stats.activeUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#D1D1D1]/60">New This Week</span>
                            <span className="text-sm font-bold text-[#FFD1D1]">{stats.thisWeek.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #696969;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD1D1;
          border-radius: 2px;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default DiscoverySidebar;
