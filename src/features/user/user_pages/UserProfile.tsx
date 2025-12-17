import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogin } from "../../auth/components/LoginProvider";
import DefUserAvatar from '../../../components/ui/DefUserAvatar';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ActivityCard from '../../trending/components/ActivityCard';
import UserCommentsModal from '../components/UserCommentsModal';
import UserItemsModal from '../components/UserItemsModal';
import ItemModals from '../../trending/components/dashboard/ItemModals';
import { spotifyFetch } from '../../../features/spotify/services/spotifyConnection';
import { supabase } from '../../../lib/supabaseClient';

import {
    getPublicProfile,
    getUserAverageRating,
    getUserComments,
    getUserRecentFavorites,
    getUserRecentRatings,
    getUserPublicPlaylists
} from '../services/user_profile_services';
import { Play, Heart, Star, Lock, Music, ChevronDown } from 'lucide-react';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useLogin();

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

    // Window status 
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [viewAllModal, setViewAllModal] = useState<{ title: string, items: any[] } | null>(null);

    const isOwnProfile = currentUser?.id === userId;

    // Click handling logic
    const handleItemClick = useCallback((item: any) => {
        if (item.type === 'track') setSelectedTrack(item.rawData);
        else if (item.type === 'album') setSelectedAlbum(item.item_id);
        else if (item.type === 'playlist') setSelectedPlaylist(item.rawData);
    }, []);

    // filter Unknown/Null
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
                imageUrl = d?.imageUrl || supabase.storage.from('playlists').getPublicUrl(item.item_id).data.publicUrl;
            }
            return { ...item, name, title: name, artist, imageUrl, color, type: item.item_type, rawData };
        });

        // Core fix: If name is empty or "Unknown Title", do not return this data
        return enriched.filter(item => item.name && item.name !== "Unknown Title");
    };

    const loadProfileData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const profileData = await getPublicProfile(userId);
            setProfile(profileData);
            if (profileData.is_private_profile && currentUser?.id !== userId) { setLoading(false); return; }

            const [ratingRes, pls, favs, rates, comms] = await Promise.all([
                getUserAverageRating(userId),
                getUserPublicPlaylists(userId),
                getUserRecentFavorites(userId, 50),
                getUserRecentRatings(userId, 50),
                getUserComments(userId, 0, 10)
            ]);

            // enhance filter item
            const [enrichedFavs, enrichedRates, enrichedPls] = await Promise.all([
                enrichItems(favs || []), 
                enrichItems(rates || []),
                enrichItems((pls || []).map(p => ({...p, item_id: p.id, item_type: 'playlist'})))
            ]);

            // Enhance filter for Activity Feed
            const rawComments = comms.data || [];
            const enrichedCommentTargets = await enrichItems(rawComments.map((c: any) => ({
                item_id: c.item_id,
                item_type: c.item_type
            })));

            // only keep valid comments
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
                .filter(c => c !== null); // Remove invalid comments

            const ratingData = ratingRes as any;
            let average = 0, count = 0;
            if (ratingData && typeof ratingData === 'object') {
                average = parseFloat(ratingData.average || '0');
                count = ratingData.count || 0;
            } else {
                average = parseFloat(ratingRes || '0');
                count = enrichedRates.length; 
            }

            setRatingStats({ average, count });
            setCommentCount(comms.count || 0);
            setPlaylists(enrichedPls);
            setEnrichedFavorites(enrichedFavs);
            setEnrichedRatings(enrichedRates);
            setRecentComments(formattedComments);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [userId, currentUser]);

    useEffect(() => { if (userId) loadProfileData(); }, [loadProfileData, userId]);

    const isLocked = profile?.is_private_profile && !isOwnProfile;

    const UniversalThumbnail = ({ item }: { item: any }) => {
        const [imgError, setImgError] = useState(false);
        return (
            <div className="aspect-square bg-black/30 rounded-2xl overflow-hidden relative mb-3 shadow-xl border border-white/5 group-hover:scale-105 transition-all duration-300">
                {item.imageUrl && !imgError ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : item.color ? (
                    <div className="w-full h-full opacity-60" style={{ backgroundColor: item.color }} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><Music size={40} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Play fill="white" size={24}/></div>
            </div>
        );
    };

    if (loading) return <div className="h-full flex items-center justify-center bg-[#696969]"><LoadingSpinner /></div>;
    if (!profile) return <div className="p-8 text-white bg-[#696969]">User not found.</div>;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#696969]">
            {/* Header */}
            <div className="pt-12 pb-6 px-6">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-[3px] border-white/10 shadow-2xl bg-[#2a2a2a] mb-5">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <DefUserAvatar className="w-full h-full p-12 text-gray-500" />}
                    </div>
                    <div className="text-center w-full">
                        <h1 className="text-4xl font-bold text-white mb-1">{profile.display_name}</h1>
                        <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-3">@{profile.username}</p>
                        <div className="max-w-md mx-auto mb-4"><p className="text-white text-base italic leading-relaxed">{profile.bio || "No bio."}</p></div>
                        {!isLocked && (
                            <div className="flex items-center justify-center gap-10 py-3">
                                <div className="text-center"><p className="text-xl font-bold text-white">{playlists.length}</p><p className="text-[10px] text-white/40 uppercase tracking-widest">Playlists</p></div>
                                <div className="text-center cursor-pointer relative" onClick={() => setShowRatingInfo(!showRatingInfo)}>
                                    <div className="flex items-center justify-center gap-1.5"><p className="text-xl font-bold text-white">{Number(ratingStats.average || 0).toFixed(1)}</p><Star size={14} className="fill-[#FFD1D1] text-[#FFD1D1]"/></div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Avg Rating</p>
                                    <AnimatePresence>{showRatingInfo && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#181818] border border-white/10 p-3 rounded-lg shadow-2xl min-w-[140px]">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 text-center">Total Ratings</p><p className="text-lg font-bold text-[#FFD1D1] text-center">{ratingStats.count}</p>
                                        </motion.div>
                                    )}</AnimatePresence>
                                </div>
                                <div className="text-center"><p className="text-xl font-bold text-white">{commentCount}</p><p className="text-[10px] text-white/40 uppercase tracking-widest">Comments</p></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLocked ? (
                <div className="py-20 text-center border-t border-white/10"><Lock className="mx-auto mb-2 text-white/10" size={30}/><p className="text-white/40 uppercase text-xs">Private Account</p></div>
            ) : (
                <>
                    {/* Tab Navigation - Fixed overlap and non-italic */}
                    <div className="bg-[#696969] pt-2">
                        <div className="max-w-4xl mx-auto border-t border-white/10 px-6 flex justify-center gap-12 relative">
                            {['music', 'activity'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t as any)} className={`py-6 text-2xl font-bold uppercase transition-all relative ${activeTab === t ? 'text-white' : 'text-white/30 hover:text-white'}`}>
                                    {t === 'music' ? 'Music' : 'Activity'}
                                    {activeTab === t && (
                                        <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD1D1] rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-10 space-y-16">
                        {activeTab === 'music' ? (
                            <>
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1 text-white"><h2 className="text-xl font-bold uppercase tracking-tight">Created Playlists</h2>{playlists.length > 5 && <button onClick={() => setViewAllModal({title: 'Created Playlists', items: playlists})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}</div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">{playlists.slice(0, 5).map(p => (<div key={p.id} onClick={() => handleItemClick(p)} className="group cursor-pointer"><UniversalThumbnail item={p} /><h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{p.name}</h3></div>))}</div>
                                </section>
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1">
                                        <div className="flex items-center gap-8 text-white"><h2 className="text-xl font-bold uppercase tracking-tight">Favorites</h2>
                                            <div className="flex gap-2 bg-black/40 p-1 rounded-full border border-white/5 shadow-inner">
                                                {['all', 'track', 'album', 'playlist'].map(f => (<button key={f} onClick={() => setFavFilter(f)} className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all uppercase ${favFilter === f ? 'bg-[#FFD1D1] text-black shadow-md' : 'text-white/60 hover:text-white'}`}>{f === 'playlist' ? 'Playlists' : f + 's'}</button>))}
                                            </div>
                                        </div>
                                        {enrichedFavorites.filter(f=>favFilter==='all'||f.type===favFilter).length > 5 && <button onClick={() => setViewAllModal({title: 'All Favorites', items: enrichedFavorites.filter(f=>favFilter==='all'||f.type===favFilter)})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">{enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter).slice(0, 5).map(f => (<div key={f.id} onClick={() => handleItemClick(f)} className="group flex flex-col cursor-pointer"><UniversalThumbnail item={f} /><h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{f.name}</h3><p className="text-[10px] text-white/40 uppercase truncate mt-1">{f.artist || f.type}</p></div>))}</div>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1 text-white">
                                        <div className="flex items-center gap-8"><h2 className="text-xl font-bold uppercase tracking-tight">Ratings</h2>
                                            <div className="relative">
                                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-black/40 border border-white/5 rounded-full px-5 py-2 text-[11px] font-bold text-white/80 hover:bg-black/60 transition-all flex items-center gap-4 uppercase shadow-lg min-w-[140px]">
                                                    <span className="flex-1 text-left">{starFilter === 0 ? 'All Ratings' : starFilter}</span>
                                                    <ChevronDown size={14} className={`ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>{isDropdownOpen && (
                                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full mt-2 left-0 z-[100] bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
                                                        <button onClick={() => { setStarFilter(0); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase hover:bg-[#FFD1D1] hover:text-black transition-colors ${starFilter === 0 ? 'bg-[#FFD1D1]/10 text-[#FFD1D1]' : 'text-white/60'}`}>All Ratings</button>
                                                        {[5, 4, 3, 2, 1].map((val) => (
                                                            <button key={val} onClick={() => { setStarFilter(val); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase hover:bg-[#FFD1D1] hover:text-black transition-colors ${starFilter === val ? 'bg-[#FFD1D1]/10 text-[#FFD1D1]' : 'text-white/60'}`}>{val}</button>
                                                        ))}
                                                    </motion.div>
                                                )}</AnimatePresence>
                                            </div>
                                        </div>
                                        {enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).length > 5 && <button onClick={() => setViewAllModal({title: 'Rating History', items: enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter)})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">{enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).slice(0, 5).map(r => (<div key={r.id} onClick={() => handleItemClick(r)} className="group cursor-pointer"><UniversalThumbnail item={r} /><h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{r.name}</h3></div>))}</div>
                                </section>
                                <section>
                                    <div className="flex justify-between items-center mb-6 text-white"><h2 className="text-xl font-bold uppercase tracking-tight">Recent Activity</h2><button onClick={() => setShowCommentsModal(true)} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">Full History</button></div>
                                    <div className="bg-black/15 rounded-3xl border border-white/5 p-6 backdrop-blur-sm shadow-inner"><div className="space-y-4">{recentComments.length > 0 ? recentComments.map((c, i) => <ActivityCard key={c.id} activity={c} index={i} />) : <div className="py-14 text-center text-white/10 text-xs uppercase font-bold tracking-widest">No activity</div>}</div></div>
                                </section>
                            </>
                        )}
                    </div>
                </>
            )}

            <ItemModals 
                selectedPlaylist={selectedPlaylist} 
                selectedTrack={selectedTrack} 
                selectedAlbum={selectedAlbum} 
                onClose={() => { 
                    setSelectedPlaylist(null); 
                    setSelectedTrack(null); 
                    setSelectedAlbum(null); 
                    loadProfileData(); 
                }} 
            />

            <AnimatePresence>
                {showCommentsModal && <UserCommentsModal userId={userId!} onClose={() => setShowCommentsModal(false)} />}
                {viewAllModal && <UserItemsModal title={viewAllModal.title} items={viewAllModal.items} onClose={() => setViewAllModal(null)} onItemClick={(i:any)=> { handleItemClick(i); setViewAllModal(null); }} />}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;