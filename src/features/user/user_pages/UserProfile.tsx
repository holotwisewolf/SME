import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DefUserAvatar from '../../../components/ui/DefUserAvatar';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ActivityCard from '../../trending/components/ActivityCard';
import UserCommentsModal from '../components/UserCommentsModal';
import UserItemsModal from '../components/UserItemsModal';
import ItemModals from '../../trending/components/dashboard/ItemModals';
import { Play, Star, Lock, Music, ChevronDown } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useState } from 'react';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const {
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
        handleItemClick
    } = useUserProfile(userId);

    const favDropdownRef = useRef<HTMLDivElement>(null);
    const ratingDropdownRef = useRef<HTMLDivElement>(null);
    const ratingInfoRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (favDropdownRef.current && !favDropdownRef.current.contains(event.target as Node)) setIsFavDropdownOpen(false);
            if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
            if (ratingInfoRef.current && !ratingInfoRef.current.contains(event.target as Node)) setShowRatingInfo(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsFavDropdownOpen, setIsDropdownOpen, setShowRatingInfo]);

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
                {item.rating && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-[#FFD1D1] flex items-center gap-1 shadow-lg z-10 border border-white/10">
                        <Star size={10} fill="#FFD1D1" className="text-[#FFD1D1]" />
                        {item.rating}
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Play fill="white" size={24} /></div>
            </div>
        );
    };

    if (loading) return <div className="h-full flex items-center justify-center bg-[#696969]"><LoadingSpinner /></div>;
    if (!profile) return <div className="p-8 text-white bg-[#696969]">User not found.</div>;

    const handleUserClick = (id: string) => { if (id) navigate(`/profile/${id}`); };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-[#696969] font-sans">
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
                                <div className="text-center cursor-pointer relative" ref={ratingInfoRef} onClick={() => setShowRatingInfo(!showRatingInfo)}>
                                    <div className="flex items-center justify-center gap-1.5"><p className="text-xl font-bold text-white">{Number(ratingStats.average || 0).toFixed(1)}</p><Star size={14} className="fill-[#FFD1D1] text-[#FFD1D1]" /></div>
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
                <div className="flex-1 flex flex-col items-center px-4 py-20 border-t border-white/10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl">
                        <div className="bg-black/20 backdrop-blur-md p-16 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FFD1D1]/5 rounded-full blur-3xl group-hover:bg-[#FFD1D1]/10 transition-colors duration-700" />
                            <div className="relative">
                                <div className="w-24 h-24 rounded-3xl bg-black/40 flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-white/10 shadow-xl">
                                    <Lock className="w-12 h-12 text-[#FFD1D1]/80" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Private Account</h2>
                            <div className="w-12 h-1.5 bg-[#FFD1D1] mb-8 rounded-full shadow-[0_0_15px_rgba(255,209,209,0.3)]" />
                            <p className="text-white/40 text-center font-bold text-sm leading-relaxed uppercase tracking-widest max-w-[280px]">This user has set their profile to private.</p>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <>
                    <div className="bg-[#696969] pt-2">
                        <div className="max-w-4xl mx-auto border-t border-white/10 px-6 flex justify-center gap-12 relative">
                            {['music', 'activity'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t as any)} className={`py-6 text-2xl font-bold uppercase transition-all relative ${activeTab === t ? 'text-white' : 'text-white/30 hover:text-white'}`}>
                                    {t === 'music' ? 'Music' : 'Activity'}
                                    {activeTab === t && <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD1D1] rounded-t-full" />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto px-6 py-10 space-y-16">
                        {activeTab === 'music' ? (
                            <>
                                <section>
                                    <div className="flex justify-between items-end mb-4 px-1 text-white">
                                        <h2 className="text-xl font-bold uppercase tracking-tight">Created Playlists</h2>
                                        {playlists.length > 5 && <button onClick={() => setViewAllModal({ title: 'Created Playlists', items: playlists })} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}
                                    </div>
                                    <div className="bg-black/15 rounded-3xl border border-white/5 p-6 backdrop-blur-sm min-h-[200px] flex items-center justify-center">
                                        {playlists.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
                                                {playlists.slice(0, 5).map(p => (
                                                    <div key={p.id} onClick={() => handleItemClick(p)} className="group cursor-pointer">
                                                        <UniversalThumbnail item={p} />
                                                        <h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{p.name}</h3>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="text-white/10 text-xs font-bold uppercase tracking-widest">No playlists created</div>}
                                    </div>
                                </section>
                                <section>
                                    <div className="flex justify-between items-end mb-4 px-1">
                                        <div className="flex items-center gap-8 text-white">
                                            <h2 className="text-xl font-bold uppercase tracking-tight">Favorites</h2>
                                            <div className="relative" ref={favDropdownRef}>
                                                <button onClick={() => setIsFavDropdownOpen(!isFavDropdownOpen)} className="bg-black/40 border border-white/5 rounded-full px-5 py-2 text-[11px] font-bold text-white/80 hover:bg-black/60 transition-all flex items-center gap-4 uppercase shadow-lg min-w-[140px]">
                                                    <span className="flex-1 text-left">{favFilter === 'all' ? 'All Types' : favFilter === 'playlist' ? 'Playlists' : favFilter + 's'}</span>
                                                    <ChevronDown size={14} className={`ml-auto transition-transform ${isFavDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>{isFavDropdownOpen && (
                                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full mt-2 left-0 z-[100] bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
                                                        {['all', 'track', 'album', 'playlist'].map((val) => (
                                                            <button key={val} onClick={() => { setFavFilter(val); setIsFavDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase hover:bg-[#FFD1D1] hover:text-black transition-colors ${favFilter === val ? 'bg-[#FFD1D1]/10 text-[#FFD1D1]' : 'text-white/60'}`}>{val === 'all' ? 'All Types' : val === 'playlist' ? 'Playlists' : val + 's'}</button>
                                                        ))}
                                                    </motion.div>
                                                )}</AnimatePresence>
                                            </div>
                                        </div>
                                        {enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter).length > 5 && <button onClick={() => setViewAllModal({ title: 'All Favorites', items: enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter) })} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}
                                    </div>
                                    <div className="bg-black/15 rounded-3xl border border-white/5 p-6 backdrop-blur-sm min-h-[220px] flex items-center justify-center">
                                        {enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter).length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
                                                {enrichedFavorites.filter(f => favFilter === 'all' || f.type === favFilter).slice(0, 5).map(f => (
                                                    <div key={f.id} onClick={() => handleItemClick(f)} className="group flex flex-col cursor-pointer">
                                                        <UniversalThumbnail item={f} />
                                                        <h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{f.name}</h3>
                                                        <p className="text-[10px] text-white/40 uppercase truncate mt-1">{f.artist || f.type}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="text-white/10 text-xs font-bold uppercase tracking-widest">No favorites found</div>}
                                    </div>
                                </section>
                            </>
                        ) : (
                            <>
                                <section>
                                    <div className="flex justify-between items-end mb-4 px-1 text-white">
                                        <div className="flex items-center gap-8">
                                            <h2 className="text-xl font-bold uppercase tracking-tight">Ratings</h2>
                                            <div className="relative" ref={ratingDropdownRef}>
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
                                        {enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).length > 5 && <button onClick={() => setViewAllModal({ title: 'Rating History', items: enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter) })} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">View All</button>}
                                    </div>
                                    <div className="bg-black/15 rounded-3xl border border-white/5 p-6 backdrop-blur-sm min-h-[200px] flex items-center justify-center">
                                        {enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
                                                {enrichedRatings.filter(r => starFilter === 0 || r.rating === starFilter).slice(0, 5).map(r => (
                                                    <div key={r.id} onClick={() => handleItemClick(r)} className="group cursor-pointer">
                                                        <UniversalThumbnail item={r} />
                                                        <h3 className="text-[12px] font-bold text-white/90 truncate group-hover:text-[#FFD1D1] transition-colors">{r.name}</h3>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="text-white/10 text-xs font-bold uppercase tracking-widest">No ratings yet</div>}
                                    </div>
                                </section>
                                <section>
                                    <div className="flex justify-between items-center mb-4 text-white">
                                        <h2 className="text-xl font-bold uppercase tracking-tight">Recent Comments</h2>
                                        <button onClick={() => setShowCommentsModal(true)} className="text-xs font-black text-white/30 hover:text-[#FFD1D1] uppercase">Full History</button>
                                    </div>
                                    <div className="bg-black/15 rounded-3xl border border-white/5 p-6 backdrop-blur-sm shadow-inner min-h-[150px] flex items-center justify-center">
                                        {recentComments.length > 0 ? (
                                            <div className="space-y-4 w-full">
                                                {recentComments.slice(0, 3).map((c, i) => <ActivityCard key={c.id} activity={c} index={i} onUserClick={handleUserClick} />)}
                                            </div>
                                        ) : <div className="text-white/10 text-xs font-bold uppercase tracking-widest">No comments found</div>}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </>
            )}
            <ItemModals selectedPlaylist={selectedPlaylist} selectedTrack={selectedTrack} selectedAlbum={selectedAlbum} onClose={() => { setSelectedPlaylist(null); setSelectedTrack(null); setSelectedAlbum(null); }} />
            <AnimatePresence>
                {showCommentsModal && <UserCommentsModal userId={userId!} onClose={() => setShowCommentsModal(false)} />}
                {viewAllModal && <UserItemsModal title={viewAllModal.title} items={viewAllModal.items} onClose={() => setViewAllModal(null)} onItemClick={(i: any) => { handleItemClick(i); }} />}
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;