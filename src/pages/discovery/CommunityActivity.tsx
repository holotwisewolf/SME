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

// [NEW] Navigation Hook
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate(); // [NEW]
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
        fetchActivities();

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
                    fetchActivities();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchActivities = async () => {
        if (activities.length === 0) setLoading(true);

        try {
            const data = await getRecentActivity(50);
            const playlistIds: string[] = [];

            // 1. Identify all playlist-related logs
            data.forEach((item: any) => {
                const type = (item.itemType || item.item_type || item.type || '').toLowerCase();
                if (type === 'playlist' && item.track?.id) {
                    playlistIds.push(item.track.id);
                }
            });

            // 2. Fetch both privacy status AND creator's user_id from playlists table
            const playlistMetadata = new Map<string, { is_public: boolean, user_id: string }>();
            if (playlistIds.length > 0) {
                const { data: dbData } = await supabase
                    .from('playlists')
                    .select('id, is_public, user_id') // We use user_id here as creator ID
                    .in('id', playlistIds);

                if (dbData) {
                    dbData.forEach(p => playlistMetadata.set(p.id, {
                        is_public: p.is_public ?? false,
                        user_id: p.user_id
                    }));
                }
            }

            // 3. Filter private playlists and manually attach the creator's user_id
            const mappedActivities = data.filter(activity => {
                const type = (activity.itemType || activity.item_type || activity.type || '').toLowerCase();
                if (type === 'playlist') {
                    const meta = playlistMetadata.get(activity.track?.id);
                    // Hide activity if playlist is private or deleted
                    if (!meta || !meta.is_public) return false;

                    // Inject the creator's user_id into the local object for the Card to use
                    if (activity.track) {
                        activity.track.user_id = meta.user_id;
                    }
                }
                return true;
            });

            setActivities(mappedActivities);
        } catch (error) {
            console.error('Error fetching/mapping community activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchActivities();
        setRefreshing(false);
    };

    // --- CLICK HANDLERS ---

    // 1. [NEW] Handle User Click
    const handleUserClick = (userId: string) => {
        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

    // 2. Handle Track Click
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

    // 3. Handle Artist Click
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

    const handleAlbumClick = (albumId: string) => {
        if (!albumId) return;
        setSelectedAlbumId(albumId);
    };

    const handlePlaylistClick = async (playlistId: string) => {
        if (!playlistId) return;
        setIsLoadingDetails(true);

        try {
            const session = await getSession();
            const currentUserId = session?.user?.id;

            const { data: playlist, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', playlistId)
                .single();

            if (error || !playlist) {
                showError("This playlist is private or no longer exists");
                setIsLoadingDetails(false);
                return;
            }

            const isOwner = currentUserId && playlist.user_id === currentUserId;
            const isPublic = playlist.is_public === true;

            if (!isPublic && !isOwner) {
                showError("This is a private playlist");
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
                                onUserClick={handleUserClick} // [NEW] Pass the handler
                            />
                        ))}
                    </div>
                )}
            </div>

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