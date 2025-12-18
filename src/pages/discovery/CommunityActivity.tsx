import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import ActivityCard from '../../features/trending/components/ActivityCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getRecentActivity } from '../../features/trending/services/trending_services';

// Imports for Playlist Logic
import { supabase } from '../../lib/supabaseClient';
import { getSession } from '../../features/auth/services/auth_services';
import { useError } from '../../context/ErrorContext';
import { ExpandedPlaylistCard } from '../../features/playlist/components/expanded_card/ExpandedPlaylistCard';
import type { Tables } from '../../types/supabase';

// Import Modals
import { TrackReviewModal } from '../../features/favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { ArtistDetailModal } from '../../features/spotify/components/ArtistDetailModal';
import { ExpandedAlbumCard } from '../../features/favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';

// Import Services
import {
    getTrackDetails,
    getArtistDetails,
    searchArtists
} from '../../features/spotify/services/spotify_services';

import type { SpotifyTrack } from '../../features/spotify/type/spotify_types';
import type { ArtistFullDetail } from '../../features/spotify/type/artist_type';

type ActivityType = 'all' | 'rating' | 'comment' | 'favorite' | 'tag';

const CommunityActivity: React.FC = () => {
    const { showError } = useError();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<ActivityType>('all');
    const [refreshing, setRefreshing] = useState(false);

    // --- Modal State ---
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<ArtistFullDetail | null>(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Tables<'playlists'> | null>(null);

    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // --- REALTIME SUBSCRIPTION ---
    useEffect(() => {
        // 1. Initial Fetch
        fetchActivities();

        // 2. Realtime Subscription
        // We subscribe to two things:
        // A. New Activities (INSERT on public.activities)
        // B. Playlist Updates (UPDATE on public.playlists) -> This makes it reappear instantly when you switch to Public
        const channel = supabase
            .channel('community-feed-universal')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'activities' },
                (payload) => {
                    console.log('⚡ New Activity Detected:', payload);
                    fetchActivities();
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'playlists' },
                (payload) => {
                    console.log('⚡ Playlist Updated (Privacy Change):', payload);
                    fetchActivities(); // Re-fetch to apply filtering rules based on new privacy status
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchActivities = async () => {
        // Only show spinner on empty list to prevent flashing during live updates
        if (activities.length === 0) setLoading(true);

        try {
            // Get activity feed - RLS now handles privacy filtering at DB level
            const data = await getRecentActivity(50);

            // Filter for data integrity only (not privacy - RLS handles that)
            const validActivities = data.filter((activity: any) => {
                const type = (activity.itemType || activity.item_type || activity.type || '').toLowerCase();
                const isPlaylistActivity = type === 'playlist' || (activity.track && activity.track.type === 'playlist');

                // For playlists, ensure we have valid data
                if (isPlaylistActivity) {
                    const playlistData = activity.track;
                    // Data integrity check only - privacy is handled by RLS
                    return playlistData && playlistData.id && playlistData.title;
                }

                // Keep all other activities
                return true;
            });

            setActivities(validActivities);
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

    // --- Click Handlers ---

    // 1. Handle Track Click
    const handleTrackClick = async (trackId: string) => {
        if (!trackId) return;
        setIsLoadingDetails(true);
        try {
            const trackData = await getTrackDetails(trackId);
            setSelectedTrack(trackData);
        } catch (error) {
            console.error("Failed to fetch track details:", error);
            showError("Failed to load track details");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // 2. Handle Artist Click
    const handleArtistClick = async (identifier: string) => {
        if (!identifier) return;
        setIsLoadingDetails(true);
        try {
            let finalArtistId = identifier;
            const isName = identifier.includes(' ') || identifier.length !== 22;

            if (isName) {
                const searchResult = await searchArtists(identifier, 1);
                const bestMatch = searchResult.items?.[0];
                if (bestMatch?.id) {
                    finalArtistId = bestMatch.id;
                } else {
                    setIsLoadingDetails(false);
                    return;
                }
            }

            const spotifyArtistData = await getArtistDetails(finalArtistId);
            const artistDetail: ArtistFullDetail = {
                id: spotifyArtistData.id,
                name: spotifyArtistData.name,
                imageUrl: spotifyArtistData.images?.[0]?.url || '',
                genres: spotifyArtistData.genres || [],
                popularity: spotifyArtistData.popularity,
                followers: spotifyArtistData.followers?.total || 0,
                externalUrl: spotifyArtistData.external_urls?.spotify || ''
            };
            setSelectedArtist(artistDetail);
        } catch (error) {
            console.error("Failed to load artist data:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // 3. Handle Album Click
    const handleAlbumClick = (albumId: string) => {
        if (!albumId) return;
        setSelectedAlbumId(albumId);
    };

    // 4. Handle Playlist Click
    const handlePlaylistClick = async (playlistId: string) => {
        if (!playlistId) return;
        setIsLoadingDetails(true);

        try {
            const session = await getSession();
            const currentUserId = session?.user?.id;

            // Fetch Playlist Details
            const { data: playlist, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', playlistId)
                .single();

            if (error || !playlist) {
                showError("Playlist not found");
                setIsLoadingDetails(false);
                return;
            }

            // Standard Access Check (Backup Security)
            const isOwner = currentUserId && playlist.user_id === currentUserId;
            const isPublic = playlist.is_public === true;

            if (!isPublic && !isOwner) {
                showError("Cant view this playlist cz it is private");
                setIsLoadingDetails(false);
                return;
            }

            setSelectedPlaylist(playlist);

        } catch (error) {
            console.error("Error handling playlist click:", error);
            showError("Failed to load playlist");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleCloseArtistModal = () => {
        setSelectedArtist(null);
    };

    // --- Filtering ---
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
        <div className="h-full flex flex-col p-8 relative">
            {/* Header & Refresh */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FFD1D1]/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-[#FFD1D1]" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">Community Activity</h1>
                            <p className="text-[#D1D1D1]/60 mt-1">Real-time feed of community interactions</p>
                        </div>
                    </div>
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
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${filterType === type.value ? 'bg-black/20' : 'bg-[#FFD1D1]/10'
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
                        <p className="text-xl font-semibold text-[#D1D1D1] mb-2">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-4">
                        {filteredActivities.map((activity, index) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                index={index}
                                onTrackClick={handleTrackClick}
                                onArtistClick={handleArtistClick}
                                onAlbumClick={handleAlbumClick}
                                onPlaylistClick={handlePlaylistClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {selectedArtist && (
                <ArtistDetailModal
                    artist={selectedArtist}
                    onClose={handleCloseArtistModal}
                />
            )}

            {selectedAlbumId && (
                <ExpandedAlbumCard
                    albumId={selectedAlbumId}
                    onClose={() => setSelectedAlbumId(null)}
                />
            )}

            {selectedPlaylist && (
                <ExpandedPlaylistCard
                    playlist={selectedPlaylist}
                    onClose={() => setSelectedPlaylist(null)}
                    onTitleChange={(newTitle) => setSelectedPlaylist(prev => prev ? { ...prev, title: newTitle } : null)}
                    onColorChange={(newColor) => setSelectedPlaylist(prev => prev ? { ...prev, color: newColor } : null)}
                    onDeletePlaylist={() => {
                        setSelectedPlaylist(null);
                        handleRefresh();
                    }}
                />
            )}

            {isLoadingDetails && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default CommunityActivity;