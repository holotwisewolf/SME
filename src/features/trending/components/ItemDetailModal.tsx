// ItemDetailModal - Generic modal for viewing track/album details from trending

import React, { useState, useEffect } from 'react';
import { X, Star, MessageCircle, Heart, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface ItemDetailModalProps {
    itemId: string;
    itemType: 'track' | 'album';
    onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ itemId, itemType, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [itemData, setItemData] = useState<any>(null);
    const [stats, setStats] = useState({ avgRating: 0, ratingCount: 0, commentCount: 0, favoriteCount: 0 });
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        fetchItemDetails();
    }, [itemId, itemType]);

    const fetchItemDetails = async () => {
        setLoading(true);
        try {
            // Fetch item stats
            const { data: statsData } = await supabase
                .from('item_stats')
                .select('*')
                .eq('item_id', itemId)
                .eq('item_type', itemType)
                .single();

            if (statsData) {
                setStats({
                    avgRating: statsData.average_rating || 0,
                    ratingCount: statsData.rating_count || 0,
                    commentCount: statsData.comment_count || 0,
                    favoriteCount: statsData.favorite_count || 0
                });
            }

            // Fetch tags
            const { data: tagsData } = await supabase
                .from('item_tags')
                .select(`
                    tag_id,
                    tags (name)
                `)
                .eq('item_id', itemId)
                .eq('item_type', itemType);

            if (tagsData) {
                setTags(tagsData.map(t => (t.tags as any)?.name).filter(Boolean));
            }

            // For now, we'll use basic info from the item ID
            // In a real app, you'd fetch from Spotify API or your database
            setItemData({
                id: itemId,
                name: itemId, // Placeholder
                type: itemType
            });

        } catch (error) {
            console.error('Error fetching item details:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl mx-auto border border-white/5 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-[#FFD1D1]/20 text-[#FFD1D1] text-xs rounded-full capitalize border border-[#FFD1D1]/30">
                                    {itemType}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{itemData?.name || 'Unknown'}</h2>
                            <p className="text-gray-400 text-sm">ID: {itemId}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-4 h-4 text-[#FFD1D1] fill-[#FFD1D1]" />
                                    <span className="text-white font-semibold">{stats.avgRating.toFixed(1)}</span>
                                </div>
                                <p className="text-gray-400 text-xs">{stats.ratingCount} ratings</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <MessageCircle className="w-4 h-4 text-[#FFD1D1]" />
                                    <span className="text-white font-semibold">{stats.commentCount}</span>
                                </div>
                                <p className="text-gray-400 text-xs">comments</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Heart className="w-4 h-4 text-[#FFD1D1]" />
                                    <span className="text-white font-semibold">{stats.favoriteCount}</span>
                                </div>
                                <p className="text-gray-400 text-xs">favorites</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Tag className="w-4 h-4 text-[#FFD1D1]" />
                                    <span className="text-white font-semibold">{tags.length}</span>
                                </div>
                                <p className="text-gray-400 text-xs">tags</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-white font-medium mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-gray-400 text-sm text-center">
                                This is a read-only view. Full {itemType} details and interactions are coming soon!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
