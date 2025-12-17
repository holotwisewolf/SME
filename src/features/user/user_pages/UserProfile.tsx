import React, { useEffect, useState } from 'react';
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
import { Play, Heart, Star, Lock, Music, List } from 'lucide-react';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useLogin();
    
    // Data States
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ avgRating: '0.0', commentCount: 0 });
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
    
    // window status 
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

    const [viewAllModal, setViewAllModal] = useState<{title: string, items: any[]} | null>(null);

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

        return items.map(item => {
            let name = item.item_id;
            let artist = "";
            let imageUrl = null;
            let rawData = null; 

            if (item.item_type === 'track') {
                const d = trackMap.get(item.item_id);
                name = d?.name || name;
                artist = d?.artists?.[0]?.name || "";
                imageUrl = d?.album?.images?.[0]?.url;
                rawData = d;
            } else if (item.item_type === 'album') {
                const d = albumMap.get(item.item_id);
                name = d?.name || name;
                artist = d?.artists?.[0]?.name || "";
                imageUrl = d?.images?.[0]?.url;
                rawData = item.item_id;
            } else if (item.item_type === 'playlist') {
                const d = playlistMap.get(item.item_id);
                name = d?.title || "Private Playlist";
                artist = "Collection";
                rawData = d;
            }
            return { ...item, name, artist, imageUrl, type: item.item_type, title: name, subtitle: artist, rawData };
        });
    };

    const loadProfileData = async () => {
        setLoading(true);
        try {
            const profileData = await getPublicProfile(userId!);
            setProfile(profileData);
            if (profileData.is_private_profile && !isOwnProfile) { setLoading(false); return; }

            const [ratingAvg, pls, favs, rates, comms] = await Promise.all([
                getUserAverageRating(userId!),
                getUserPublicPlaylists(userId!),
                getUserRecentFavorites(userId!, 50),
                getUserRecentRatings(userId!, 50),
                getUserComments(userId!, 0, 5)
            ]);

            const [enrichedFavs, enrichedRates] = await Promise.all([enrichItems(favs || []), enrichItems(rates || [])]);
            setStats({ avgRating: ratingAvg, commentCount: comms.count || 0 });
            setPlaylists(pls || []);
            setEnrichedFavorites(enrichedFavs);
            setEnrichedRatings(enrichedRates);
            setRecentComments((comms.data || []).map((c: any) => ({
                id: c.id, type: 'comment', user: c.profiles?.username, itemId: c.item_id, itemType: c.item_type, preview: c.content, timestamp: c.created_at
            })));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { if (userId) loadProfileData(); }, [userId]);

    const handleItemClick = (item: any) => {
        if (item.type === 'track') setSelectedTrack(item.rawData);
        else if (item.type === 'album') setSelectedAlbum(item.item_id);
        else if (item.type === 'playlist') setSelectedPlaylist(item.rawData);
    };

    if (loading) return <div className="h-full flex items-center justify-center bg-[#696969]"><LoadingSpinner /></div>;
    if (!profile) return <div className="p-8 text-white bg-[#696969]">User not found.</div>;

    const isLocked = profile.is_private_profile && !isOwnProfile;

    const renderFilterTabs = (current: any, set: Function, options: any[]) => (
        <div className="flex gap-1.5 bg-[#1a1a1a]/30 p-1 rounded shadow-inner">
            {options.map(opt => (
                <button key={opt.id} onClick={() => set(opt.id)} className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${current === opt.id ? 'bg-[#FFD1D1] text-black shadow-md' : 'text-white/60 hover:text-white'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#696969]">
            
            {/* Header Section */}
            <div className="pt-12 pb-6 px-6 relative">
                <div className="max-w-4xl mx-auto flex flex-col items-center relative">
                    {isOwnProfile && (
                        <button onClick={() => navigate('/account')} className="absolute right-0 top-0 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md text-xs font-bold text-white transition uppercase tracking-widest shadow-sm">
                            Edit Profile
                        </button>
                    )}
                    <div className="w-40 h-40 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl bg-[#2a2a2a] mb-5">
                        {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <DefUserAvatar className="w-full h-full p-12 text-gray-500" />}
                    </div>
                    <div className="text-center w-full">
                        <h1 className="text-4xl font-bold text-white tracking-tight leading-none mb-1">{profile.display_name}</h1>
                        <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-3">@{profile.username}</p>
                        <div className="max-w-md mx-auto mb-4"><p className="text-white text-base italic font-medium leading-relaxed">{profile.bio ? `"${profile.bio}"` : "No bio."}</p></div>
                        {!isLocked && (
                            <div className="flex items-center justify-center gap-10 py-3 border-y border-white/10">
                                <div className="text-center"><p className="text-xl font-bold text-white leading-none">{playlists.length}</p><p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">Playlists</p></div>
                                <div className="text-center"><p className="text-xl font-bold text-white leading-none flex items-center justify-center gap-1.5">{stats.avgRating}<Star size={14} className="fill-[#FFD1D1] text-[#FFD1D1]"/></p><p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">Avg Rating</p></div>
                                <div className="text-center"><p className="text-xl font-bold text-white leading-none">{stats.commentCount}</p><p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1.5">Comments</p></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLocked ? (
                <div className="py-20 text-center"><Lock className="mx-auto mb-2 text-white/10" size={30}/><p className="text-white/40 font-black uppercase text-xs tracking-widest">Private Account</p></div>
            ) : (
                <>
                    {/* Tab Navigation */}
                    <div className="sticky top-0 z-30 bg-[#696969]/95 backdrop-blur-sm border-b border-white/10">
                        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-12">
                            {['music', 'activity'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t as any)} className={`py-4 text-sm font-black uppercase tracking-[0.25em] relative transition-all ${activeTab === t ? 'text-[#FFD1D1]' : 'text-white/40 hover:text-white'}`}>
                                    {t}{activeTab === t && <motion.div layoutId="utline_tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFD1D1] rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-10 space-y-16">
                        {activeTab === 'music' ? (
                            <>
                                {/* Playlists */}
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1">
                                        <h2 className="text-base font-black text-white uppercase tracking-widest italic">Created Playlists</h2>
                                        {playlists.length > 5 && <button onClick={() => setViewAllModal({title: 'Created Playlists', items: playlists.map(p=>({...p, name:p.title, type:'playlist', rawData: p}))})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase tracking-widest transition-colors">View All</button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                        {playlists.slice(0, 5).map(p => (
                                            <div key={p.id} onClick={() => setSelectedPlaylist(p)} className="group cursor-pointer">
                                                <div className="aspect-square bg-black/30 rounded-lg overflow-hidden relative mb-3 shadow-xl border border-white/5 group-hover:border-[#FFD1D1]/40 transition-all duration-300">
                                                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/5"><List size={36}/></div>}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"><Play fill="white" size={28}/></div>
                                                </div>
                                                <h3 className="text-[12px] font-bold text-white/90 truncate px-0.5 group-hover:text-[#FFD1D1] transition-colors">{p.title}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Favorites */}
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1">
                                        <div className="flex items-center gap-8">
                                            <h2 className="text-base font-black text-white uppercase tracking-widest italic">Favorites</h2>
                                            {renderFilterTabs(favFilter, setFavFilter, [
                                                {id:'all', label:'ALL'}, {id:'track', label:'TRACKS'}, {id:'album', label:'ALBUMS'}, {id:'playlist', label:'PLAYLISTS'}
                                            ])}
                                        </div>
                                        {enrichedFavorites.filter(f=>favFilter==='all'||f.type===favFilter).length > 5 && <button onClick={() => setViewAllModal({title: 'All Favorites', items: enrichedFavorites.filter(f=>favFilter==='all'||f.type===favFilter)})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase tracking-widest transition-colors">View All</button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                        {enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter).slice(0, 5).map(f => (
                                            <div key={f.id} onClick={() => handleItemClick(f)} className="group flex flex-col cursor-pointer">
                                                <div className="aspect-square bg-black/30 rounded-lg overflow-hidden mb-3 relative border border-white/5 shadow-lg group-hover:border-[#FFD1D1]/30 transition-all duration-300">
                                                    {f.imageUrl ? <img src={f.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/5"><Music size={28}/></div>}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"><Play fill="white" size={24}/></div>
                                                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md shadow-md"><Heart className="fill-[#FFD1D1] text-[#FFD1D1]" size={12}/></div>
                                                </div>
                                                <h3 className="text-[12px] font-bold text-white/90 truncate px-0.5 group-hover:text-[#FFD1D1] transition-colors">{f.name}</h3>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter px-0.5 mt-1">{f.artist || f.type}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <>
                                {/* Ratings */}
                                <section>
                                    <div className="flex justify-between items-end mb-6 px-1">
                                        <div className="flex items-center gap-8">
                                            <h2 className="text-base font-black text-white uppercase tracking-widest italic">Ratings</h2>
                                            {renderFilterTabs(starFilter, setStarFilter, [
                                                {id:0, label:'ALL'}, {id:5, label:'5★'}, {id:4, label:'4★'}, {id:3, label:'3★'}, {id:2, label:'2★'}, {id:1, label:'1★'}
                                            ])}
                                        </div>
                                        {enrichedRatings.filter(r=>starFilter===0 || r.rating === starFilter).length > 5 && <button onClick={() => setViewAllModal({title: 'Rating History', items: enrichedRatings.filter(r=>starFilter===0 || r.rating === starFilter)})} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase tracking-widest transition-colors">View All</button>}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                                        {enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).slice(0, 5).map(r => (
                                            <div key={r.id} onClick={() => handleItemClick(r)} className="group cursor-pointer">
                                                <div className="aspect-square bg-black/30 rounded-lg overflow-hidden mb-3 relative border border-white/5 shadow-xl group-hover:border-[#FFD1D1]/30 transition-all duration-300">
                                                    {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/5"><Star size={28}/></div>}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"><Play fill="white" size={24}/></div>
                                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[11px] font-black text-[#FFD1D1] flex items-center gap-1 shadow-lg border border-white/5"><Star size={10} fill="currentColor"/>{r.rating}</div>
                                                </div>
                                                <h3 className="text-[12px] font-bold text-white/90 truncate px-0.5 group-hover:text-[#FFD1D1] transition-colors">{r.name}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Activity */}
                                <section>
                                    <div className="flex justify-between items-center mb-6 pt-10 border-t border-white/10">
                                        <h2 className="text-base font-black text-white uppercase tracking-widest italic">Recent Feed</h2>
                                        <button onClick={() => setShowCommentsModal(true)} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase tracking-widest">Full History</button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentComments.length > 0 ? (
                                            recentComments.map((c, i) => <ActivityCard key={c.id} activity={c} index={i} />)
                                        ) : (
                                            <div className="py-14 text-center text-white/20 bg-black/10 rounded-2xl border border-white/5 italic text-xs uppercase font-bold tracking-widest">No social activity</div>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* grouped window logic detail */}
            <ItemModals 
                selectedPlaylist={selectedPlaylist}
                selectedTrack={selectedTrack}
                selectedAlbum={selectedAlbum}
                onClose={() => {
                    setSelectedPlaylist(null);
                    setSelectedTrack(null);
                    setSelectedAlbum(null);
                }}
            />

            <AnimatePresence>
                {showCommentsModal && <UserCommentsModal userId={userId!} onClose={() => setShowCommentsModal(false)} />}
                {viewAllModal && (
                    <UserItemsModal 
                        title={viewAllModal.title} 
                        items={viewAllModal.items} 
                        onClose={() => setViewAllModal(null)} 
                        onItemClick={(i:any)=> {
                            handleItemClick(i);
                            setViewAllModal(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;