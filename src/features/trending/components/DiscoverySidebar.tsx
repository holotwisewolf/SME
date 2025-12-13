// DiscoverySidebar - Right sidebar with community insights

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity } from 'lucide-react';
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
                getRecentActivity(10),
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
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getActivityText = (activity: any) => {
        switch (activity.type) {
            case 'rating':
                return `rated ${activity.itemType}`;
            case 'comment':
                return `commented on ${activity.itemType}`;
            case 'favorite':
                return `favorited ${activity.itemType}`;
            default:
                return 'interacted with';
        }
    };

    return (
        <div className="w-80 flex-shrink-0 space-y-6">
            {/* Trending Tags */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#FFD1D1]" />
                    <h3 className="text-lg font-bold text-[#D1D1D1]">Trending Tags</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="w-5 h-5 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : trendingTags.length > 0 ? (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag, index) => (
                                <button
                                    key={tag.name}
                                    className="px-3 py-1.5 bg-[#696969]/30 hover:bg-[#FFD1D1]/20 border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/40 rounded-full text-xs text-[#D1D1D1] transition-all duration-200"
                                    style={{
                                        fontSize: `${0.75 + (trendingTags.length - index) * 0.03}rem`
                                    }}
                                >
                                    #{tag.name} ({tag.count})
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#D1D1D1]/50 mt-4">
                            Click a tag to filter results
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-[#D1D1D1]/50">No trending tags yet</p>
                )}
            </div>

            {/* Community Pulse */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-[#FFD1D1]" />
                    <h3 className="text-lg font-bold text-[#D1D1D1]">Community Pulse</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="w-5 h-5 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentActivity.length > 0 ? (
                    <>
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="text-sm">
                                    <p className="text-[#D1D1D1]/70">
                                        <span className="text-[#FFD1D1] font-medium">@{activity.user}</span>{' '}
                                        {getActivityText(activity)}
                                        {activity.type === 'rating' && activity.value && (
                                            <span className="text-[#D1D1D1] ml-1">({activity.value}★)</span>
                                        )}
                                    </p>
                                    {activity.preview && (
                                        <p className="text-[#D1D1D1]/50 text-xs mt-1 italic">"{activity.preview}"</p>
                                    )}
                                    <p className="text-[#D1D1D1]/50 text-xs mt-1">{getRelativeTime(activity.timestamp)}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-[#D1D1D1]/50 mt-4">
                            Real-time community activity
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-[#D1D1D1]/50">No recent activity</p>
                )}
            </div>

            {/* Quick Stats */}
            <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#FFD1D1]" />
                    <h3 className="text-lg font-bold text-[#D1D1D1]">Quick Stats</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-20">
                        <div className="w-5 h-5 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[#D1D1D1]/70">Total Items</span>
                            <span className="text-lg font-bold text-[#FFD1D1]">{stats.totalItems.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[#D1D1D1]/70">Active Users</span>
                            <span className="text-lg font-bold text-[#FFD1D1]">{stats.activeUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-[#D1D1D1]/70">This Week</span>
                            <span className="text-lg font-bold text-[#FFD1D1]">{stats.thisWeek.toLocaleString()}</span>
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
      `}</style>
        </div>
    );
};

export default DiscoverySidebar;
