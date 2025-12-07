import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ExternalLink, Tag } from 'lucide-react';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';
import { submitPersonalRating } from '../../../../features/ratings/services/rating_services';
import { supabase } from '../../../../lib/supabaseClient';
import ExpandButton from '../../../../components/ui/ExpandButton';

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
    const [imgError, setImgError] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                className="relative w-full max-w-5xl h-[515px] bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 border border-white/5"
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-20">
                    <ExpandButton
                        onClick={onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                    />
                </div>

                {/* Left Column: Metadata (Matches PlaylistHeader style) */}
                <div className="w-full md:w-[35%] p-6 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto hidden-scrollbar">
                    {/* Title & Artist */}
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-tight mb-1">
                            {track.name}
                        </h2>
                        <p className="text-sm text-gray-400">
                            By <span className="text-white">{track.artists.map((a: any) => a.name).join(', ')}</span>
                        </p>
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative group shrink-0">
                        {!imgError ? (
                            <img
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                                <span className="text-xs">No Image</span>
                            </div>
                        )}

                        {/* Spotify Link Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a
                                href={track.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#1DB954] text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Spotify
                            </a>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1">
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
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <svg
                                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Your Rating</span>
                    </div>

                    {/* Tags Section */}
                    <div className="flex-1 min-h-0">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tags</h3>
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="+ Add"
                                className="px-2 py-0.5 bg-transparent border-b border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30 w-20 transition-all focus:w-28"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.length > 0 ? (
                                tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors flex items-center gap-1 group">
                                        #{tag}
                                        <button onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 text-xs italic">No tags</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Interaction */}
                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                        {(['review', 'community'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-6 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm relative">
                        {activeTab === 'review' ? (
                            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <label className="text-sm font-medium text-[#A7A7A7] uppercase tracking-wider mb-3">Your Journal</label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Write your thoughts on this track..."
                                    className="w-full flex-1 bg-[#181818] text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1DB954] placeholder-[#A7A7A7]/50 text-sm leading-relaxed"
                                />
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    {/* Mock Community Feed */}
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-[#181818] p-4 rounded-lg border border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                                                    <span className="font-medium text-white text-sm">User {i}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                                                    <span className="text-xs text-gray-400">4.5</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                This track absolutely blew my mind. The production quality is insane!
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
