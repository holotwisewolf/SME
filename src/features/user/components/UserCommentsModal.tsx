import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityCard from '../../trending/components/ActivityCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { getUserComments } from '../services/user_profile_services';

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

    useEffect(() => {
        loadComments(0, true);
        
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [userId]);

    const loadComments = async (pageNum: number, reset: boolean = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await getUserComments(userId, pageNum, LIMIT);
            
            //  ActivityCard
            const formatted = (data || []).map((c: any) => ({
                id: c.id,
                type: 'comment',
                user: c.profiles?.username || 'Unknown',
                itemId: c.item_id,
                itemType: c.item_type,
                preview: c.content,
                timestamp: c.created_at
            }));

            if (reset) {
                setComments(formatted);
            } else {
                setComments(prev => [...prev, ...formatted]);
            }

            if (!data || data.length < LIMIT) {
                setHasMore(false);
            }
            setPage(pageNum);

        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-[#1f1f1f] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Comment History</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        {comments.map((activity, idx) => (
                            <ActivityCard key={`${activity.id}-${idx}`} activity={activity} index={idx} />
                        ))}
                        
                        {comments.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                No comments found.
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center mt-8 pb-4">
                            <button
                                onClick={() => loadComments(page + 1)}
                                disabled={loading}
                                className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-full text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <LoadingSpinner className="w-3 h-3 text-white" />}
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserCommentsModal;