import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { spotifyFetch } from '../../../features/spotify/services/spotifyConnection';
import {
    getPublicProfile,
    getUserAverageRating,
    getUserComments,
    getUserRecentFavorites,
    getUserRecentRatings,
    getUserPublicPlaylists
} from '../services/user_profile_services';
import { useLogin } from "../../auth/components/LoginProvider";

export const useUserProfile = (userId: string | undefined) => {
    const { user: currentUser } = useLogin();
    const currentUserRef = useRef(currentUser);

    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
    const [commentCount, setCommentCount] = useState(0);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [enrichedFavorites, setEnrichedFavorites] = useState<any[]>([]);
    const [enrichedRatings, setEnrichedRatings] = useState<any[]>([]);
    const [recentComments, setRecentComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [activeTab, setActiveTab] = useState<'music' | 'activity'>('music');
    const [favFilter, setFavFilter] = useState<string>('all');
    const [starFilter, setStarFilter] = useState<number>(0);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showRatingInfo, setShowRatingInfo] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFavDropdownOpen, setIsFavDropdownOpen] = useState(false);

    // Modal States
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [viewAllModal, setViewAllModal] = useState<{ title: string, items: any[] } | null>(null);

    // Keep ref up to date
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    const isOwnProfile = currentUser?.id === userId;

    const enrichItems = async (items: any[]) => {
        if (!items || items.length === 0) return [];
        const trackIds = items.filter(i => i.item_type === 'track').map(i => i.item_id);
        const albumIds = items.filter(i => i.item_type === 'album').map(i => i.item_id);
        const playlistIds = items.filter(i => i.item_type === 'playlist').map(i => i.item_id);

        let trackMap = new Map();
        let albumMap = new Map();
        let playlistMap = new Map();

        try {
            if (trackIds.length > 0) {
                const data = await spotifyFetch(`/tracks?ids=${trackIds.join(',')}`);
                data.tracks.forEach((t: any) => t && trackMap.set(t.id, t));
            }
            if (albumIds.length > 0) {
                const data = await spotifyFetch(`/albums?ids=${albumIds.join(',')}`);
                data.albums.forEach((a: any) => a && albumMap.set(a.id, a));
            }
            if (playlistIds.length > 0) {
                const { data: pData } = await supabase.from('playlists').select('*').in('id', playlistIds);
                pData?.forEach(p => playlistMap.set(p.id, p));
            }
        } catch (e) { console.error(e); }

        const enriched = items.map(item => {
            let name = null, artist = "", imageUrl = null, color = null, rawData = null;

            if (item.item_type === 'track') {
                const d = trackMap.get(item.item_id);
                name = d?.name; artist = d?.artists?.[0]?.name || ""; imageUrl = d?.album?.images?.[0]?.url; rawData = d;
            } else if (item.item_type === 'album') {
                const d = albumMap.get(item.item_id);
                name = d?.name; artist = d?.artists?.[0]?.name || ""; imageUrl = d?.images?.[0]?.url; rawData = item.item_id;
            } else if (item.item_type === 'playlist') {
                const d = playlistMap.get(item.item_id);
                name = d?.title; artist = "Playlist"; color = d?.color; rawData = d;
                imageUrl = d?.imageUrl || (item.item_id ? supabase.storage.from('playlists').getPublicUrl(item.item_id).data.publicUrl : null);
            }
            return { ...item, name, title: name, artist, imageUrl, color, type: item.item_type, rawData };
        });

        return enriched.filter(item => item.name && item.name !== "Unknown Title");
    };

    const loadProfileData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const profileData = await getPublicProfile(userId);
            setProfile(profileData);

            if (profileData.is_private_profile && currentUserRef.current?.id !== userId) {
                setLoading(false);
                return;
            }

            const [ratingRes, pls, favs, rates, comms] = await Promise.all([
                getUserAverageRating(userId),
                getUserPublicPlaylists(userId),
                getUserRecentFavorites(userId, 50),
                getUserRecentRatings(userId, 50),
                getUserComments(userId, 0, 10)
            ]);

            const [enrichedFavs, enrichedRates, enrichedPls] = await Promise.all([
                enrichItems(favs || []),
                enrichItems(rates || []),
                enrichItems((pls || []).map(p => ({ ...p, item_id: p.id, item_type: 'playlist' })))
            ]);

            const rawComments = comms.data || [];
            const enrichedCommentTargets = await enrichItems(rawComments.map((c: any) => ({
                item_id: c.item_id,
                item_type: c.item_type
            })));

            const formattedComments = rawComments
                .map((c: any) => {
                    const target = enrichedCommentTargets.find(t => t.item_id === c.item_id);
                    if (!target) return null;
                    return {
                        id: c.id, type: 'comment', created_at: c.created_at, content: c.content, itemType: c.item_type,
                        user: { id: c.user_id, display_name: c.profiles?.display_name || c.profiles?.username || 'User', avatar_url: c.profiles?.avatar_url },
                        track: { id: c.item_id, title: target.name, artist: target.artist }
                    };
                })
                .filter((c: any) => c !== null);

            const avgVal = typeof ratingRes === 'string' ? parseFloat(ratingRes) : (ratingRes as any).average || 0;

            setRatingStats({
                average: avgVal,
                count: comms.count || enrichedRates.length
            });
            setCommentCount(comms.count || 0);
            setPlaylists(enrichedPls);
            setEnrichedFavorites(enrichedFavs);
            setEnrichedRatings(enrichedRates);
            setRecentComments(formattedComments);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { if (userId) loadProfileData(); }, [loadProfileData, userId]);

    const handleItemClick = useCallback((item: any) => {
        if (item.type === 'track') setSelectedTrack(item.rawData);
        else if (item.type === 'album') setSelectedAlbum(item.item_id);
        else if (item.type === 'playlist') setSelectedPlaylist(item.rawData);
    }, []);

    return {
        // State
        profile,
        ratingStats,
        commentCount,
        playlists,
        enrichedFavorites,
        enrichedRatings,
        recentComments,
        loading,
        activeTab, setActiveTab,
        favFilter, setFavFilter,
        starFilter, setStarFilter,
        showCommentsModal, setShowCommentsModal,
        showRatingInfo, setShowRatingInfo,
        isDropdownOpen, setIsDropdownOpen,
        isFavDropdownOpen, setIsFavDropdownOpen,
        selectedPlaylist, setSelectedPlaylist,
        selectedTrack, setSelectedTrack,
        selectedAlbum, setSelectedAlbum,
        viewAllModal, setViewAllModal,
        isOwnProfile,

        // Handlers
        handleItemClick
    };
};
