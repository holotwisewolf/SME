// useDiscoveryData - Custom hook for fetching and managing discovery items data

import { useState, useEffect } from 'react';
import { getDiscoveryTracks, getDiscoveryAlbums, getDiscoveryPlaylists } from '../services/discovery_services';
import type { DiscoveryItem, DiscoveryFilters } from '../types/discovery';
import { useError } from '../../../context/ErrorContext';
import { parseSpotifyError } from '../../spotify/services/spotifyConnection';

type TabType = 'tracks' | 'albums' | 'playlists';

interface UseDiscoveryDataReturn {
    items: DiscoveryItem[];
    loading: boolean;
    topThree: DiscoveryItem[];
    remaining: DiscoveryItem[];
    refetch: () => Promise<void>;
}

export function useDiscoveryData(
    activeTab: TabType,
    filters: DiscoveryFilters,
    limit: number = 20,
    refreshKey: number = 0
): UseDiscoveryDataReturn {
    const { showError } = useError();
    const [items, setItems] = useState<DiscoveryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDiscoveryItems = async () => {
        setLoading(true);
        try {
            let fetchedItems: DiscoveryItem[] = [];

            switch (activeTab) {
                case 'tracks':
                    fetchedItems = await getDiscoveryTracks(filters, limit);
                    break;
                case 'albums':
                    fetchedItems = await getDiscoveryAlbums(filters, limit);
                    break;
                case 'playlists':
                    fetchedItems = await getDiscoveryPlaylists(filters, limit);
                    break;
            }

            setItems(fetchedItems);
        } catch (error) {
            console.error('Error fetching trending items:', error);
            const msg = parseSpotifyError(error, 'Failed to fetch trending items');
            showError(msg);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when tab, filters, or refreshKey change
    useEffect(() => {
        fetchDiscoveryItems();
    }, [activeTab, filters, refreshKey]);

    // Split items into top 3 and rest
    const topThree = items.slice(0, 3);
    const remaining = items.slice(3);

    return {
        items,
        loading,
        topThree,
        remaining,
        refetch: fetchDiscoveryItems,
    };
}
