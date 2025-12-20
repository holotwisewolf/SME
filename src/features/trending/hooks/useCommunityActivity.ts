import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { getRecentActivity } from '../services/trending_services';
import { getSession } from '../../auth/services/auth_services';
import { useError } from '../../../context/ErrorContext';
import {
    getTrackDetails,
    getArtistDetails,
    searchArtists
} from '../../spotify/services/spotify_services';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import type { ArtistFullDetail } from '../../spotify/type/artist_type';
import type { Tables } from '../../../types/supabase';

export type ActivityType = 'all' | 'rating' | 'comment' | 'favorite' | 'tag';

export const useCommunityActivity = () => {
    const { showError } = useError();
    const navigate = useNavigate();
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

    const handleUserClick = (userId: string) => {
        if (userId) {
            navigate(`/profile/${userId}`);
        }
    };

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

    return {
        activities,
        loading,
        filterType, setFilterType,
        refreshing,
        selectedTrack, setSelectedTrack,
        selectedArtist, setSelectedArtist,
        selectedAlbumId, setSelectedAlbumId,
        selectedPlaylist, setSelectedPlaylist,
        isLoadingDetails,
        handleRefresh,
        handleUserClick,
        handleTrackClick,
        handleArtistClick,
        handleAlbumClick,
        handlePlaylistClick,
        handleCloseArtistModal
    };
};
