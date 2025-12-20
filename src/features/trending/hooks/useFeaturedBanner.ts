import { useState, useEffect } from 'react';
import type { TrendingItem } from '../types/trending';
import { fetchPlaylistTracksWithDetails } from '../../playlist/services/playlist_services';
import { getAlbumTracks } from '../../spotify/services/spotify_services';
import { supabase } from '../../../lib/supabaseClient';

export interface UseFeaturedBannerProps {
    topThree: TrendingItem[];
}

export const useFeaturedBanner = (topThree: TrendingItem[]) => {
    // --- State ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tracks, setTracks] = useState<any[]>([]);
    const [loadingTracks, setLoadingTracks] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [imgError, setImgError] = useState(false);

    // Get the current item
    const currentItem = topThree[currentIndex];
    const [creatorName, setCreatorName] = useState<string>(currentItem?.artist || 'Unknown');

    // State to hold the image fetched directly from DB
    const [dbImage, setDbImage] = useState<string | null>(null);

    // --- LOGIC UPDATE: Image Priority ---
    // 1. dbImage (Fresh from DB fetch inside this component)
    // 2. playlistimg_url (Passed from parent if available)
    // 3. imageUrl (Standard fallback / Spotify image)
    const displayImage = dbImage || (currentItem as any)?.playlistimg_url || currentItem?.imageUrl;

    // --- Effects ---

    // 1. Reset image error and dbImage when item changes
    useEffect(() => {
        setImgError(false);
        setDbImage(null); // Reset local image state so we don't show the wrong one while loading
    }, [currentIndex, topThree]);

    // 2. Auto-rotate carousel every 10 seconds
    useEffect(() => {
        if (!topThree.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % topThree.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [topThree.length, resetKey]);

    // 3. Fetch Creator Name AND Image (Supabase Integration)
    // We combined the image fetch here to ensure we get the latest 'playlistimg_url'
    useEffect(() => {
        if (!currentItem) return;

        const fetchCreatorAndImage = async () => {
            let resolvedName = currentItem.artist || 'Unknown';
            let resolvedImage = null;

            if (currentItem.type === 'playlist') {
                try {
                    // A. Find the User ID AND the Custom Image from playlists table
                    // CHANGED: Added 'playlistimg_url' to the select
                    const { data: playlistData, error: plError } = await supabase
                        .from('playlists')
                        .select('user_id, playlistimg_url')
                        .eq('id', currentItem.id)
                        .single();

                    if (!plError && playlistData) {
                        // Capture the image from DB
                        if (playlistData.playlistimg_url) {
                            resolvedImage = playlistData.playlistimg_url;
                        }

                        // B. Fetch the Display Name from Profiles
                        const { data: profile, error: profError } = await supabase
                            .from('profiles')
                            .select('display_name, username')
                            .eq('id', playlistData.user_id)
                            .single();

                        if (!profError && profile) {
                            resolvedName = profile.display_name || profile.username || resolvedName;
                        }
                    }
                } catch (err) {
                    console.error("Error fetching creator profile/image:", err);
                }
            }

            setCreatorName(resolvedName);
            if (resolvedImage) {
                setDbImage(resolvedImage);
            }
        };

        fetchCreatorAndImage();
    }, [currentItem?.id, currentItem?.type, currentItem?.artist]);


    // 4. Fetch Tracks (Playlist vs Album)
    useEffect(() => {
        if (!currentItem) return;

        const fetchTracks = async () => {
            setLoadingTracks(true);
            try {
                if (currentItem.type === 'playlist') {
                    const playlistTracks = await fetchPlaylistTracksWithDetails(currentItem.id);
                    setTracks(playlistTracks || []);
                } else if (currentItem.type === 'album') {
                    const data = await getAlbumTracks(currentItem.id);
                    const validTracks = data?.items?.map((track: any) => ({
                        details: {
                            name: track.name,
                            artists: track.artists,
                            duration_ms: track.duration_ms,
                            album: {
                                // Use the resolved displayImage here too for consistency
                                images: [{ url: displayImage }]
                            }
                        },
                        spotify_track_id: track.id
                    })) || [];
                    setTracks(validTracks);
                } else {
                    // Fallback dummy data
                    setTracks([
                        { details: { name: 'Top Track 1', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 200000 }, spotify_track_id: '1' },
                        { details: { name: 'Top Track 2', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 180000 }, spotify_track_id: '2' },
                        { details: { name: 'Top Track 3', artists: [{ name: currentItem.artist || 'Artist' }], duration_ms: 240000 }, spotify_track_id: '3' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching tracks:', error);
                setTracks([]);
            } finally {
                setLoadingTracks(false);
            }
        };

        fetchTracks();
    }, [currentItem?.id, currentItem?.type, displayImage]);

    // --- Helpers ---

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatCount = (count: number) => {
        if (count >= 1000) return `${Math.floor(count / 1000)}k+`;
        return count.toString();
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1: return { text: 'text-red-500', bg: 'bg-red-500/10' };
            case 2: return { text: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 3: return { text: 'text-blue-500', bg: 'bg-blue-500/10' };
            default: return { text: 'text-[#FFD1D1]', bg: 'bg-[#FFD1D1]/10' };
        }
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        setResetKey(prev => prev + 1);
    };

    return {
        currentIndex,
        tracks,
        loadingTracks,
        imgError, setImgError,
        currentItem,
        creatorName,
        displayImage,
        formatDuration,
        formatCount,
        getRankBadgeColor,
        handleDotClick
    };
};
