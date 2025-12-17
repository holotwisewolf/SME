import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityCard from '../../trending/components/ActivityCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getUserComments } from '../services/user_profile_services';
import { spotifyFetch } from '../../../features/spotify/services/spotifyConnection';
import { supabase } from '../../../lib/supabaseClient';

interface UserCommentsModalProps {
    userId: string;
    onClose: () => void;
}

const UserCommentsModal: React.FC<UserCommentsModalProps> = ({ userId, onClose }) => {
    const [comments, setComments] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const LIMIT = 20;

    const enrichItems = async (items: any[]) => {
        if (!items || items.length === 0) return [];
        const trackIds = [...new Set(items.filter(i => i.item_type === 'track').map(i => i.item_id))];
        const albumIds = [...new Set(items.filter(i => i.item_type === 'album').map(i => i.item_id))];
        const playlistIds = [...new Set(items.filter(i => i.item_type === 'playlist').map(i => i.item_id))];
        
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
                const { data: pData } = await supabase.from('playlists').select('id, title').in('id', playlistIds);
                pData?.forEach(p => playlistMap.set(p.id, p.title));
            }
        } catch (e) { console.error(e); }

        return items.map(item => ({
            name: item.item_type === 'playlist' ? playlistMap.get(item.item_id) : (item.item_type === 'track' ? trackMap.get(item.item_id)?.name : albumMap.get(item.item_id)?.name) || "Unknown Title",
            artist: item.item_type === 'track' ? trackMap.get(item.item_id)?.artists?.[0]?.name : (item.item_type === 'album' ? albumMap.get(item.item_id)?.artists?.[0]?.name : "Playlist")
        }));
    };

    const loadComments = async (pageNum: number, reset: boolean = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await getUserComments(userId, pageNum, LIMIT);
            if (!data) return;

            const enriched = await enrichItems(data);
            
            const formatted = data.map((c: any, index: number) => ({
                id: c.id,
                type: 'comment',
                created_at: c.created_at,
                content: c.content,
                itemType: c.item_type,
                user: {
                    id: c.user_id,
                    display_name: c.profiles?.display_name || c.profiles?.username || 'User',
                    avatar_url: c.profiles?.avatar_url
                },
                track: {
                    id: c.item_id,
                    title: enriched[index].name,
                    artist: enriched[index].artist
                }
            }));

            setComments(prev => reset ? formatted : [...prev, ...formatted]);
            setHasMore(data.length === LIMIT);
            setPage(pageNum);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => {
        loadComments(0, true);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [userId]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-2xl bg-[#1f1f1f] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Full Activity</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#121212]">
                    <div className="space-y-4">
                        {comments.map((activity, idx) => (
                            <ActivityCard key={`${activity.id}-${idx}`} activity={activity} index={idx} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-8 pb-4">
                            <button onClick={() => loadComments(page + 1)} disabled={loading} className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-full text-xs font-bold transition">
                                {loading ? 'Loading...' : 'Load More History'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserCommentsModal;