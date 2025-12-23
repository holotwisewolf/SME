import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ArrowRight, Lock, Star, Heart, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import DefUserAvatar from '../../../components/ui/DefUserAvatar';
import { getPublicProfile, getUserRecentFavorites } from '../services/user_profile_services';
import { supabase } from '../../../lib/supabaseClient';
import { spotifyFetch } from '../../spotify/services/spotifyConnection';

interface UserPreviewModalProps {
    userId: string;
    onClose: () => void;
}

const UserPreviewModal: React.FC<UserPreviewModalProps> = ({ userId, onClose }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [ratingStats, setRatingStats] = useState({ avg: '0.0', count: 0 });
    const [recentFavorites, setRecentFavorites] = useState<any[]>([]);

    // --- Sub-Component: ---
    const FavoriteThumbnail = ({ item }: { item: any }) => {
        const [imgError, setImgError] = useState(false);


        if (item.imageUrl && !imgError) {
            return (
                <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                    onError={() => setImgError(true)}
                    alt="Cover"
                />
            );
        }


        return (
            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a]">
                <Music size={20} className="text-white/20" />
            </div>
        );
    };

    const enrichFavorites = async (items: any[]) => {
        if (!items || items.length === 0) return [];

        const trackIds = items.filter(i => i.item_type === 'track').map(i => i.item_id);
        const albumIds = items.filter(i => i.item_type === 'album').map(i => i.item_id);
        const playlistIds = items.filter(i => i.item_type === 'playlist').map(i => i.item_id);

        let imgMap = new Map<string, string>();

        try {
            const promises = [];
            if (trackIds.length > 0) {
                promises.push(spotifyFetch(`/tracks?ids=${trackIds.join(',')}`).then(d =>
                    d.tracks.forEach((t: any) => t && imgMap.set(t.id, t.album?.images?.[0]?.url))
                ));
            }
            if (albumIds.length > 0) {
                promises.push(spotifyFetch(`/albums?ids=${albumIds.join(',')}`).then(d =>
                    d.albums.forEach((a: any) => a && imgMap.set(a.id, a.images?.[0]?.url))
                ));
            }
            if (playlistIds.length > 0) {

                playlistIds.forEach(id => {
                    const { data } = supabase.storage.from('playlists').getPublicUrl(id);
                    if (data) imgMap.set(id, data.publicUrl);
                });
            }
            await Promise.all(promises);
        } catch (e) { console.error("Error fetching images", e); }

        return items.map(item => ({
            ...item,
            imageUrl: imgMap.get(item.item_id)
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const profileData = await getPublicProfile(userId);
                setProfile(profileData);

                if (!profileData.is_private_profile) {
                    const { data: ratings } = await supabase
                        .from('ratings')
                        .select('rating')
                        .eq('user_id', userId);

                    if (ratings && ratings.length > 0) {
                        const total = ratings.reduce((acc, curr) => acc + curr.rating, 0);
                        setRatingStats({
                            avg: (total / ratings.length).toFixed(1),
                            count: ratings.length
                        });
                    }

                    const favs = await getUserRecentFavorites(userId, 3);
                    const enrichedFavs = await enrichFavorites(favs || []);
                    setRecentFavorites(enrichedFavs);
                }
            } catch (error) {
                console.error("Failed to load user preview", error);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchData();
    }, [userId]);

    const handleViewFullProfile = () => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    if (!userId) return null;

    const isPrivate = profile?.is_private_profile;

    return createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col items-center p-8 text-center group"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#FFD1D1]/5 blur-[60px] rounded-full pointer-events-none" />

                <button onClick={onClose} className="absolute top-5 right-5 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all z-10">
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="py-12"><LoadingSpinner /></div>
                ) : profile ? (
                    <>
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-[3px] border-[#181818] ring-2 ring-[#FFD1D1]/20 shadow-2xl overflow-hidden relative z-10">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                ) : (
                                    <DefUserAvatar className="w-full h-full p-6 text-gray-500 bg-[#222]" />
                                )}
                            </div>
                        </div>

                        <div className="mb-6 relative z-10">
                            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{profile.display_name}</h2>
                            <p className="text-[#FFD1D1] text-xs font-bold uppercase tracking-[0.2em] opacity-80">@{profile.username}</p>
                        </div>

                        <div className="w-full mb-6">
                            <div className={`
                                w-full py-3 px-5 rounded-2xl border flex items-center justify-center gap-4 backdrop-blur-sm transition-all
                                ${isPrivate
                                    ? 'bg-[#FFD1D1]/5 border-[#FFD1D1]/10 text-[#FFD1D1]/80'
                                    : 'bg-white/5 border-white/5 text-white'
                                }
                            `}>
                                {isPrivate ? (
                                    <>
                                        <Lock size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Private Account</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                                            <Star size={18} fill="#FFD1D1" className="text-[#FFD1D1]" />
                                            <span className="text-lg font-bold">{ratingStats.avg}</span>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-bold text-white/90">{ratingStats.count}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Total Ratings</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isPrivate && (
                            <div className="w-full mb-8">
                                <div className="flex items-center gap-2 mb-3 justify-center opacity-60">
                                    <Heart size={10} className="text-[#FFD1D1]" fill="#FFD1D1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Recent Favorites</span>
                                </div>

                                {recentFavorites.length > 0 ? (
                                    <div className="flex justify-center gap-3">
                                        {recentFavorites.map((item, idx) => (
                                            <div key={`${item.item_id}-${idx}`} className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black/20 relative group/item">

                                                {/* handle image */}
                                                <FavoriteThumbnail item={item} />

                                                {/* Tooltip */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Heart size={12} fill="white" className="text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/20 text-[10px] italic">No favorites yet</p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleViewFullProfile}
                            className="w-full bg-white text-black hover:bg-[#FFD1D1] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg group/btn"
                        >
                            <span className="uppercase tracking-wider text-xs">View Full Profile</span>
                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </>
                ) : (
                    <div className="py-10 text-white/50">User not found</div>
                )}
            </motion.div>
        </div>,
        document.body
    );
};

export default UserPreviewModal;