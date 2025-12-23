// useItemSelection - Custom hook for managing expanded card/modal state

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { getTrackDetails } from '../../spotify/services/spotify_services';
import type { DiscoveryItem } from '../types/discovery';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';

interface UseItemSelectionReturn {
    selectedPlaylist: any | null;
    selectedTrack: SpotifyTrack | null;
    selectedAlbum: string | null;
    initialTab?: string;
    initialIsTagMenuOpen?: boolean;
    handleItemClick: (item: DiscoveryItem, tab?: string, autoFocusTag?: boolean) => Promise<void>;
    clearSelection: () => void;
}

export function useItemSelection(): UseItemSelectionReturn {
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
    const [initialIsTagMenuOpen, setInitialIsTagMenuOpen] = useState<boolean | undefined>(undefined);

    const handleItemClick = async (item: DiscoveryItem, tab?: string, autoFocusTag?: boolean) => {
        setInitialTab(tab);
        setInitialIsTagMenuOpen(autoFocusTag);

        if (item.type === 'playlist') {
            try {
                // Fetch full playlist data
                const { data: playlist, error } = await supabase
                    .from('playlists')
                    .select('*')
                    .eq('id', item.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching playlist:', error);
                    return;
                }

                if (playlist) {
                    setSelectedPlaylist(playlist);
                } else {
                    // Playlist was deleted or is private (RLS blocks access)
                    console.warn('Playlist not accessible (private or deleted):', item.id);
                }
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        } else if (item.type === 'track') {
            console.log('Track clicked:', item.id);
            try {
                // Fetch full track data from Spotify
                const trackData = await getTrackDetails(item.id);
                console.log('Track data fetched:', trackData);
                if (trackData) {
                    setSelectedTrack(trackData);
                } else {
                    console.error('No track data returned');
                }
            } catch (error) {
                console.error('Error fetching track:', error);
            }
        } else if (item.type === 'album') {
            // Show expanded album card
            setSelectedAlbum(item.id);
        }
    };

    const clearSelection = () => {
        setSelectedPlaylist(null);
        setSelectedTrack(null);
        setSelectedAlbum(null);
        setInitialTab(undefined);
        setInitialIsTagMenuOpen(undefined);
    };

    return {
        selectedPlaylist,
        selectedTrack,
        selectedAlbum,
        initialTab,
        initialIsTagMenuOpen,
        handleItemClick,
        clearSelection,
    };
}
