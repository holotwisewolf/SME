// useTrendingData - Custom hook for fetching and managing trending items data

import { useState, useEffect } from 'react';
import { getTrendingTracks, getTrendingAlbums, getTrendingPlaylists } from '../services/trending_services';
import type { TrendingItem, TrendingFilters } from '../types/trending';

type TabType = 'tracks' | 'albums' | 'playlists';

interface UseTrendingDataReturn {
    items: TrendingItem[];
    loading: boolean;
    topThree: TrendingItem[];
    remaining: TrendingItem[];
    refetch: () => Promise<void>;
}

export function useTrendingData(
    activeTab: TabType,
    filters: TrendingFilters,
    limit: number = 20
): UseTrendingDataReturn {
    const [items, setItems] = useState<TrendingItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrendingItems = async () => {
        setLoading(true);
        try {
            let fetchedItems: TrendingItem[] = [];

            switch (activeTab) {
                case 'tracks':
                    fetchedItems = await getTrendingTracks(filters, limit);
                    break;
                case 'albums':
                    fetchedItems = await getTrendingAlbums(filters, limit);
                    break;
                case 'playlists':
                    fetchedItems = await getTrendingPlaylists(filters, limit);
                    break;
            }

            setItems(fetchedItems);
        } catch (error) {
            console.error('Error fetching trending items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when tab or filters change
    useEffect(() => {
        fetchTrendingItems();
    }, [activeTab, filters]);

    // Split items into top 3 and rest
    const topThree = items.slice(0, 3);
    const remaining = items.slice(3);

    return {
        items,
        loading,
        topThree,
        remaining,
        refetch: fetchTrendingItems,
    };
}
