// Community Activity Page - Real-time activity feed

import React, { useState, useEffect } from 'react';
import { Activity, Filter, RefreshCw} from 'lucide-react';
import ActivityCard from '../../features/trending/components/ActivityCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getRecentActivity } from '../../features/trending/services/trending_services';

type ActivityType = 'all' | 'rating' | 'comment' | 'favorite' | 'tag';

const CommunityActivity: React.FC = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<ActivityType>('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await getRecentActivity(50); // Fetch more for activity feed
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchActivities();
        setRefreshing(false);
    };

    const filteredActivities = filterType === 'all'
        ? activities
        : activities.filter(a => a.type === filterType);

    const activityTypes = [
        { value: 'all' as ActivityType, label: 'All Activity', count: activities.length },
        { value: 'rating' as ActivityType, label: 'Ratings', count: activities.filter(a => a.type === 'rating').length },
        { value: 'comment' as ActivityType, label: 'Comments', count: activities.filter(a => a.type === 'comment').length },
        { value: 'favorite' as ActivityType, label: 'Favorites', count: activities.filter(a => a.type === 'favorite').length },
    ];

    return (
        <div className="h-full flex flex-col p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FFD1D1]/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#FFD1D1]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">Community Activity</h1>
                            <p className="text-[#D1D1D1]/60 mt-1">Real-time feed of community interactions</p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg text-[#D1D1D1] hover:border-[#FFD1D1]/30 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {activityTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setFilterType(type.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${filterType === type.value
                                ? 'bg-[#FFD1D1] text-black'
                                : 'bg-[#292929] text-[#D1D1D1]/70 hover:text-[#D1D1D1] border border-[#D1D1D1]/10 hover:border-[#FFD1D1]/30'
                            }`}
                    >
                        {type.label}
                        {type.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${filterType === type.value
                                    ? 'bg-black/20'
                                    : 'bg-[#FFD1D1]/10'
                                }`}>
                                {type.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Activity Feed */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#FFD1D1]/20 flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-[#D1D1D1]/50" />
                        </div>
                        <p className="text-xl font-semibold text-[#D1D1D1] mb-2">No activity yet</p>
                        <p className="text-sm text-[#D1D1D1]/50">
                            {filterType === 'all'
                                ? 'Be the first to rate, comment, or favorite something!'
                                : `No ${filterType} activity found. Try a different filter.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {filteredActivities.map((activity, index) => (
                            <ActivityCard key={activity.id} activity={activity} index={index} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #696969;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD1D1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #FFD1D1;
          opacity: 0.8;
        }
      `}</style>
        </div>
    );
};

export default CommunityActivity;
