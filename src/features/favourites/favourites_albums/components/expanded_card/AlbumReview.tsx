import React from 'react';
import { MoreOptionsIcon } from '../../../../../components/ui/MoreOptionsIcon';
import { useAlbumReview } from '../../hooks/useAlbumReview';

interface AlbumReviewProps {
    albumId: string;
    album: any;
    userRating: number | null;
    tags: string[];
    setTags: (tags: string[]) => void;
    onRatingUpdate: () => void;
    onUpdate?: () => void;
    userName?: string;
}

export const AlbumReview: React.FC<AlbumReviewProps> = ({
    albumId,
    album,
    userRating,
    tags,
    setTags,
    onRatingUpdate,
    onUpdate,
    userName = 'You'
}) => {
    const {
        availableTags,
        isTagMenuOpen, setIsTagMenuOpen,
        newTag, setNewTag,
        handleAddPresetTag,
        handleRatingClick,
        handleAddTag,
        removeTag
    } = useAlbumReview({
        albumId,
        userRating,
        tags,
        setTags,
        onRatingUpdate,
        onUpdate
    });

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 gap-2 overflow-hidden">
            {/* Top Row: Rating */}
            <div className="flex items-center justify-between mb-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-white font-bold text-lg">Rating</h3>
                    <p className="text-gray-400 text-xs">Based on {userName}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[white]">
                        {userRating && userRating > 0 ? userRating : 'Not Rated'}
                    </span>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingClick(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                >
                                    <svg
                                        className={`w-4 h-4 ${star <= (userRating || 0) ? 'fill-current' : 'text-gray-600 fill-none'}`}
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

            {/* Middle Row: Album Info */}
            <div className="flex-1 flex flex-col min-h-[120px]">
                <p className="text-gray-400 text-xs mb-2">Album Info</p>
                <div className="bg-white/5 rounded-lg border border-white/5 flex-1 flex flex-col overflow-hidden p-4">
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">Artist:</span>
                            <span className="text-white ml-2">{album.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Release Date:</span>
                            <span className="text-white ml-2">{album.release_date ? new Date(album.release_date).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total Tracks:</span>
                            <span className="text-white ml-2">{album.total_tracks || 0}</span>
                        </div>
                        {album.label && (
                            <div>
                                <span className="text-gray-500">Label:</span>
                                <span className="text-white ml-2">{album.label}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Tags */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-xs">Personal Tags:</p>
                    <div className="relative tag-menu-container">
                        <button
                            onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <MoreOptionsIcon size={14} orientation="horizontal" />
                        </button>

                        {isTagMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="px-3 py-2 border-b border-white/5 bg-white/5">
                                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Add Tags</span>
                                </div>

                                {/* Custom Tag Input */}
                                <div className="px-3 py-2 border-b border-white/5">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        placeholder="Press Enter to add"
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>

                                {/* Preseeded Tags */}
                                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                    {availableTags.filter(t => !tags.includes(t.name)).length > 0 ? (
                                        availableTags
                                            .filter(t => !tags.includes(t.name))
                                            .map(tag => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleAddPresetTag(tag)}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD1D1]"></span>
                                                    {tag.name}
                                                </button>
                                            ))
                                    ) : (
                                        <div className="px-3 py-2 text-xs text-gray-500 italic">
                                            No new tags available
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Fixed height h-[45px] - items-center for vertical centering */}
                <div className="bg-white/5 rounded-lg px-2 border border-white/5 h-[45px] overflow-y-auto custom-scrollbar flex items-center py-1.5">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="group relative text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                >
                                    <span className="group-hover:opacity-0 transition-opacity">#{tag}</span>
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
                                        title="Remove tag"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
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