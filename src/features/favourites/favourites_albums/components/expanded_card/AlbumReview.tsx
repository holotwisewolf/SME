import React, { useState, useEffect } from 'react';
import { MoreOptionsIcon } from '../../../../../components/ui/MoreOptionsIcon';
import { getPreMadeTags, assignTagToItem } from '../../../../tags/services/tag_services';
import type { Tag } from '../../../../tags/type/tag_types';
import { useError } from '../../../../../context/ErrorContext';
import { useSuccess } from '../../../../../context/SuccessContext';

interface AlbumReviewProps {
    albumId: string;
    album: any;
    userRating: number | null;
    tags: string[];
    setTags: (tags: string[]) => void;
    isEditingEnabled: boolean;
}

export const AlbumReview: React.FC<AlbumReviewProps> = ({
    albumId,
    album,
    userRating,
    tags,
    setTags,
    isEditingEnabled
}) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);

    useEffect(() => {
        loadAvailableTags();
    }, []);

    // Close tag menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isTagMenuOpen && !target.closest('.tag-menu-container')) {
                setIsTagMenuOpen(false);
            }
        };

        if (isTagMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTagMenuOpen]);

    const loadAvailableTags = async () => {
        try {
            const tagsData = await getPreMadeTags();
            setAvailableTags(tagsData);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    };

    const handleAddPresetTag = async (tag: Tag) => {
        try {
            await assignTagToItem(albumId, 'album', tag.id);
            if (!tags.includes(tag.name)) {
                setTags([...tags, tag.name]);
            }
            setIsTagMenuOpen(false);
            showSuccess(`Tag #${tag.name} added`);
        } catch (error) {
            console.error('Error adding tag:', error);
            showError('Failed to add tag');
        }
    };

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
                                <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= (userRating || 0) ? 'fill-current' : 'text-gray-600 fill-none'}`}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
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
                <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-xs">Personal Tags:</p>
                    {isEditingEnabled && (
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
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {availableTags.filter(t => !tags.includes(t.name)).length > 0 ? (
                                            availableTags
                                                .filter(t => !tags.includes(t.name))
                                                .map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleAddPresetTag(tag)}
                                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
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
                    )}
                </div>
                <div className="bg-white/5 rounded-lg p-2 pt-2.5 border border-white/5 h-[46px] overflow-hidden flex items-center">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full flex items-center gap-1 transition-colors">
                                    #{tag}
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
