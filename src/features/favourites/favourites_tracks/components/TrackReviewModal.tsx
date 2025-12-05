import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ExternalLink, Tag } from 'lucide-react';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';
import { submitPersonalRating } from '../../../../features/ratings/services/rating_services';
import { supabase } from '../../../../lib/supabaseClient';

interface TrackReviewModalProps {
    track: SpotifyTrack;
    onClose: () => void;
    userRating?: number;
    userReview?: string;
    userTags?: string[];
}

export const TrackReviewModal: React.FC<TrackReviewModalProps> = ({
    track,
    onClose,
    userRating = 0,
    userReview = '',
    userTags = []
}) => {
    const [activeTab, setActiveTab] = useState<'review' | 'community'>('review');
    const [rating, setRating] = useState(userRating);
    const [review, setReview] = useState(userReview);
    const [tags, setTags] = useState<string[]>(userTags);
    const [newTag, setNewTag] = useState('');

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            if (!tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                layoutId={`track-${track.id}`}
                className="relative w-full max-w-5xl h-[85vh] bg-[#121212] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 border border-white/10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Left Column: Metadata */}
                <div className="w-full md:w-1/3 bg-[#181818] p-8 flex flex-col relative">
                    <div className="aspect-square w-full rounded-lg overflow-hidden shadow-2xl mb-6 group relative">
                        <img
                            src={track.album.images[0]?.url}
                            alt={track.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        {/* Vinyl Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl font-bold text-white leading-tight">{track.name}</h2>
                        <p className="text-[#A7A7A7] text-lg">{track.artists.map((a: any) => a.name).join(', ')}</p>
                        <p className="text-[#A7A7A7]/60 text-sm">{track.album.name} • {track.album.release_date.split('-')[0]}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#282828] p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-[#FACC15]">4.8</div>
                            <div className="text-xs text-[#A7A7A7] uppercase tracking-wider">Avg Rating</div>
                        </div>
                        <div className="bg-[#282828] p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-white">1.2k</div>
                            <div className="text-xs text-[#A7A7A7] uppercase tracking-wider">Mentions</div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in Spotify
                        </a>
                    </div>
                </div>

                {/* Right Column: Interaction */}
                <div className="flex-1 flex flex-col bg-[#121212]">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('review')}
                            className={`flex-1 py-4 text-sm font-medium uppercase tracking-wider transition-colors ${activeTab === 'review'
                                ? 'text-white border-b-2 border-[#1DB954]'
                                : 'text-[#A7A7A7] hover:text-white'
                                }`}
                        >
                            My Review
                        </button>
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`flex-1 py-4 text-sm font-medium uppercase tracking-wider transition-colors ${activeTab === 'community'
                                ? 'text-white border-b-2 border-[#1DB954]'
                                : 'text-[#A7A7A7] hover:text-white'
                                }`}
                        >
                            Community
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        {activeTab === 'review' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Rating Input */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-[#A7A7A7] uppercase tracking-wider">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={async () => {
                                                    setRating(star);
                                                    try {
                                                        const { data: { user } } = await supabase.auth.getUser();
                                                        if (user) {
                                                            await submitPersonalRating(user.id, track.id, 'track', star);
                                                        }
                                                    } catch (error) {
                                                        console.error('Error saving rating:', error);
                                                    }
                                                }}
                                                className="group focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 transition-colors ${star <= rating
                                                        ? 'text-[#FACC15] fill-[#FACC15]'
                                                        : 'text-[#282828] group-hover:text-[#FACC15]/50'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-[#A7A7A7] uppercase tracking-wider">Journal</label>
                                    <textarea
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                        placeholder="Write your thoughts on this track..."
                                        className="w-full h-48 bg-[#181818] text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1DB954] placeholder-[#A7A7A7]/50"
                                    />
                                </div>

                                {/* Tags */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-[#A7A7A7] uppercase tracking-wider">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="flex items-center gap-1 bg-[#282828] text-white px-3 py-1 rounded-full text-sm">
                                                <Tag className="w-3 h-3 text-[#1DB954]" />
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Add a tag (press Enter)..."
                                        className="w-full bg-[#181818] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1DB954] placeholder-[#A7A7A7]/50"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Mock Community Feed */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#181818] p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                                                <span className="font-medium text-white">User {i}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                                                <span className="text-sm text-white">4.5</span>
                                            </div>
                                        </div>
                                        <p className="text-[#A7A7A7] text-sm">
                                            This track absolutely blew my mind. The production quality is insane!
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
