import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingTags, getRecentActivity, getCommunityQuickStats } from '../services/trending_services';
import { supabase } from '../../../lib/supabaseClient';
import type { TrendingFilters } from '../types/trending';

interface UseDiscoverySidebarProps {
    filters?: TrendingFilters;
    onFiltersChange?: (filters: TrendingFilters) => void;
    refreshKey?: number;
}

export const useDiscoverySidebar = ({ filters, onFiltersChange, refreshKey = 0 }: UseDiscoverySidebarProps) => {
    const [trendingTags, setTrendingTags] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalItems: 0, totalMembers: 0, currentActiveUsers: 0, thisWeek: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Debounced fetch to prevent rapid-fire API calls
    const fetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const debouncedFetch = useCallback(() => {
        if (fetchDebounceRef.current) {
            clearTimeout(fetchDebounceRef.current);
        }
        fetchDebounceRef.current = setTimeout(() => {
            fetchSidebarData();
        }, 1000); // 1 second debounce for community stats
    }, []);

    useEffect(() => {
        fetchSidebarData();

        // Realtime subscription for community stats updates (debounced)
        const channel = supabase.channel('discovery-sidebar-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings' }, () => debouncedFetch())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => debouncedFetch())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'favorites' }, () => debouncedFetch())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'item_tags' }, () => debouncedFetch())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, () => debouncedFetch())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (fetchDebounceRef.current) {
                clearTimeout(fetchDebounceRef.current);
            }
        };
    }, [debouncedFetch, refreshKey]);

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

    return {
        trendingTags,
        recentActivity,
        stats,
        loading,
        navigate,
        getRelativeTime,
        handleTagClick
    };
};
