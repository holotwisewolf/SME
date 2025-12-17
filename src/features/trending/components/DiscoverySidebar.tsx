// DiscoverySidebar - Right sidebar with community insights (ENHANCED)

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity, Star, MessageCircle, Heart, Tag, ExternalLink } from 'lucide-react';
import { getTrendingTags, getRecentActivity, getCommunityQuickStats } from '../services/trending_services';
import type { TrendingFilters } from '../types/trending';

interface DiscoverySidebarProps {
    filters?: TrendingFilters;
    onFiltersChange?: (filters: TrendingFilters) => void;
}

const DiscoverySidebar: React.FC<DiscoverySidebarProps> = ({ filters, onFiltersChange }) => {
    const [trendingTags, setTrendingTags] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalItems: 0, totalMembers: 0, currentActiveUsers: 0, thisWeek: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSidebarData();
    }, []);

    const fetchSidebarData = async () => {
        setLoading(true);
        try {
            const [tags, activity, quickStats] = await Promise.all([
                getTrendingTags('week', 10),
                getRecentActivity(5),
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

    const getActivityActionText = (type: string) => {
        switch (type) {
            case 'rating': return 'rated';
            case 'comment': return 'commented on';
            case 'favorite': return 'favourited';
            case 'tag': return 'tagged';
            default: return 'interacted with';
        }
    };

    // Helper to safely get the star count number
    const getStarRating = (activity: any) => {
        const val = activity.rating_value || activity.rating || activity.value;
        return Number(val) || 0;
    };

    const handleTagClick = (tagName: string) => {
        if (!onFiltersChange || !filters) return;
        const currentTags = filters.tags || [];
        if (currentTags.includes(tagName)) {
            const newTags = currentTags.filter(t => t !== tagName);
            onFiltersChange({ ...filters, tags: newTags });
        } else {
            const newTags = [...currentTags, tagName];
            onFiltersChange({ ...filters, tags: newTags });
        }
    };

    return (
        <div className="w-80 flex-shrink-0 space-y-4 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
            {/* Trending Tags */}
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
                        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#D1D1D1]/5">
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                {trendingTags.map((tag) => {
                                    const isActive = filters?.tags?.includes(tag.name) || false;
                                    return (
                                        <button
                                            key={tag.name}
                                            onClick={() => handleTagClick(tag.name)}
                                            className={`px-2 py-1 border rounded-full text-xs transition-all duration-200 cursor-pointer ${isActive
                                                ? 'bg-[#FFD1D1]/30 border-[#FFD1D1] text-white font-semibold'
                                                : 'bg-[#696969]/30 hover:bg-[#FFD1D1]/20 border-[#D1D1D1]/10 hover:border-[#FFD1D1]/40 text-white'
                                                }`}
                                            title={isActive ? 'Click to remove filter' : 'Click to filter'}
                                        >
                                            #{tag.name} ({tag.count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <p className="text-xs text-[#D1D1D1]/40 mt-2">
                            Click a tag to filter results
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-[#D1D1D1]/50">No trending tags yet</p>
                )}
            </div>

            {/* Community Pulse */}
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
                    <div className="flex flex-col max-h-[420px] overflow-y-auto scrollbar-hide pr-1">
                        {recentActivity.map((activity, index) => (
                            <div 
                                key={activity.id} 
                                className={`flex gap-3 items-start relative ${index !== recentActivity.length - 1 ? 'border-b border-[#D1D1D1]/10 pb-4 mb-4' : ''}`}
                            >
                                {/* Icon Container */}
                                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 border border-[#D1D1D1]/5 shadow-inner">
                                    {getActivityIcon(activity.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Header Line */}
                                    <div className="text-[13px] leading-tight">
                                        <span className="text-[#FFD1D1] font-bold">
                                            @{typeof activity.user === 'object' ? activity.user.display_name : (activity.user_display_name || 'User')}
                                        </span>
                                        <span className="text-[#D1D1D1]/50 px-1">
                                            {getActivityActionText(activity.type)}
                                        </span>
                                        <span className="text-[#FFD1D1] font-medium break-words">
                                            {activity.item_title || activity.track?.title || 'Item'}
                                        </span>
                                    </div>

                                    {/* Rating Stars */}
                                    {activity.type === 'rating' && (
                                        <div className="flex gap-0.5 mt-1.5 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < getStarRating(activity) ? 'text-[#FFD1D1] fill-[#FFD1D1]' : 'text-[#D1D1D1]/10'}`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment Text - UPDATED: Vertical bar, quotes, italics */}
                                    {activity.content && (
                                        <p className="text-[13px] text-[#D1D1D1] font-normal italic leading-tight mt-2 mb-1 pl-3 border-l-2 border-[#D1D1D1]/20">
                                            "{activity.content}"
                                        </p>
                                    )}

                                    {/* Timestamp */}
                                    <p className="text-[11px] text-[#D1D1D1]/30 font-medium tracking-tight mt-0.5">
                                        {getRelativeTime(activity.timestamp || activity.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-[#D1D1D1]/50 text-center py-4">No recent activity</p>
                )}
            </div>

            {/* Quick Stats */}
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
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#D1D1D1]/5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#D1D1D1]/60">Trending Items</span>
                                <span className="text-sm font-bold text-[#FFD1D1]">{stats.totalItems.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#D1D1D1]/60">Total Members</span>
                                <span className="text-sm font-bold text-[#FFD1D1]">{stats.totalMembers.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#D1D1D1]/60">Current Active Users</span>
                                <span className="text-sm font-bold text-[#FFD1D1]">{stats.currentActiveUsers.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#D1D1D1]/60">New This Week</span>
                                <span className="text-sm font-bold text-[#FFD1D1]">{stats.thisWeek.toLocaleString()}</span>
                            </div>
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