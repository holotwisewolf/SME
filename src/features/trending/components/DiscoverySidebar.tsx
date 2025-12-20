import React from 'react';
import { TrendingUp, Clock, Activity, ExternalLink } from 'lucide-react';
import type { TrendingFilters } from '../types/trending';
import { useDiscoverySidebar } from '../hooks/useDiscoverySidebar';

interface DiscoverySidebarProps {
    filters?: TrendingFilters;
    onFiltersChange?: (filters: TrendingFilters) => void;
    refreshKey?: number;
}

const DiscoverySidebar: React.FC<DiscoverySidebarProps> = ({ filters, onFiltersChange, refreshKey = 0 }) => {
    const {
        trendingTags,
        recentActivity,
        stats,
        loading,
        navigate,
        getRelativeTime,
        handleTagClick
    } = useDiscoverySidebar({ filters, onFiltersChange, refreshKey });

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
                        <ExternalLink className="w-5 h-5" />
                    </a>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-16">
                        <div className="w-4 h-4 border-2 border-[#FFD1D1] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentActivity.length > 0 ? (
                    <>
                        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#D1D1D1]/5">
                            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide pr-2">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="text-sm border-b border-[#D1D1D1]/5 pb-2 last:border-0 last:pb-0">
                                        <p className="text-[#D1D1D1]/70 leading-relaxed">
                                            <button
                                                onClick={() => {
                                                    const userId = typeof activity.user === 'object' ? activity.user.id : activity.user_id;
                                                    if (userId) navigate(`/profile/${userId}`);
                                                }}
                                                className="text-[#FFD1D1] text-xs font-medium hover:underline cursor-pointer"
                                            >
                                                @{typeof activity.user === 'object' ? (activity.user.display_name || activity.user.username) : (activity.user_display_name || activity.user || 'User')}
                                            </button>{' '}
                                            <span className="text-[#D1D1D1]/50 text-xs">
                                                {activity.type === 'rating' && `rated ${activity.itemType || 'item'}`}
                                                {activity.type === 'comment' && `commented on ${activity.itemType || 'item'}`}
                                                {activity.type === 'favorite' && `favorited ${activity.itemType || 'item'}`}
                                                {activity.type === 'tag' && `tagged ${activity.itemType || 'item'}`}
                                                {!['rating', 'comment', 'favorite', 'tag'].includes(activity.type) && 'interacted with item'}
                                            </span>
                                        </p>
                                        {activity.content && (
                                            <p className="text-[#D1D1D1]/50 text-xs mt-1 italic pl-2 border-l border-[#D1D1D1]/20">
                                                "{activity.content}"
                                            </p>
                                        )}
                                        <p className="text-[#D1D1D1]/30 text-[10px] mt-1">
                                            {getRelativeTime(activity.timestamp || activity.created_at)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-[#D1D1D1]/40 mt-3">
                            Real-time community activity
                        </p>
                    </>
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
                                <span className="text-xs text-[#D1D1D1]/60">Active Users This Month</span>
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