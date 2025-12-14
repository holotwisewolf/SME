import React from 'react';
import { MoreOptionsIcon } from '../../../../../components/ui/MoreOptionsIcon';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';

interface TrackReviewProps {
    track: SpotifyTrack;
    userRating: number;
    review: string;
    setReview: (review: string) => void;
    tags: string[];
    newTag: string;
    setNewTag: (tag: string) => void;
    isTagMenuOpen: boolean;
    setIsTagMenuOpen: (open: boolean) => void;
    isEditingEnabled: boolean;
    handleRatingClick: (rating: number) => void;
    handleAddTag: (e: React.KeyboardEvent) => void;
    removeTag: (tag: string) => void;
}

// Helper function to format duration from ms to mm:ss
const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const TrackReview: React.FC<TrackReviewProps> = ({
    track,
    userRating,
    review,
    setReview,
    tags,
    newTag,
    setNewTag,
    isTagMenuOpen,
    setIsTagMenuOpen,
    isEditingEnabled,
    handleRatingClick,
    handleAddTag,
    removeTag
}) => {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 gap-2 overflow-hidden">
            {/* Top Row: Rating */}
            <div className="flex items-center justify-between mb-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-white font-bold text-lg">Rating</h3>
                    <p className="text-gray-400 text-xs">Based on you</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[white]">
                        {userRating || 0}
                    </span>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingClick(star)}
                                    disabled={!isEditingEnabled}
                                    className={`focus:outline-none transition-transform ${isEditingEnabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                >
                                    <svg
                                        className={`w-4 h-4 ${star <= userRating ? 'fill-current' : 'text-gray-600 fill-none'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">out of 5</span>
                    </div>
                </div>
            </div>

            {/* Middle Row: Track Info */}
            <div className="flex-1 flex flex-col min-h-[120px]">
                <p className="text-gray-400 text-xs mb-2">Track Info</p>
                <div className="bg-white/5 rounded-lg border border-white/5 flex-1 flex flex-col overflow-hidden p-4">
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">Artist:</span>
                            <span className="text-white ml-2">{track.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Album:</span>
                            <span className="text-white ml-2">{track.album?.name || 'Unknown'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="text-white ml-2">{formatDuration(track.duration_ms)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Release Date:</span>
                            <span className="text-white ml-2">{track.album?.release_date ? new Date(track.album.release_date).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Tags */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-xs">Personal Tags:</p>
                    <div className="relative tag-menu-container">
                        <button
                            onClick={() => isEditingEnabled && setIsTagMenuOpen(!isTagMenuOpen)}
                            disabled={!isEditingEnabled}
                            className={`p-1 rounded-full transition-colors ${isEditingEnabled ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'text-gray-600 cursor-default'}`}
                        >
                            <MoreOptionsIcon size={14} orientation="horizontal" />
                        </button>

                        {isTagMenuOpen && isEditingEnabled && (
                            <div className="absolute right-0 bottom-full mb-2 bg-[#2a2a2a] p-2 rounded border border-white/10 z-50">
                                <input
                                    autoFocus
                                    className="bg-black/50 text-white text-xs p-1 rounded outline-none border border-white/10"
                                    placeholder="Add tag..."
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 pt-2.5 border border-white/5 h-[46px] overflow-hidden flex items-center">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full flex items-center gap-1 transition-colors">
                                    #{tag}
                                    {isEditingEnabled && (
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
                                    )}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-500 text-xs italic">No tags currently</span>
                    )}
                </div>
            </div>
        </div>
    );
};
