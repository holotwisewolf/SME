import React, { useState, useEffect } from 'react';
import { MoreOptionsIcon } from '../../../../components/ui/MoreOptionsIcon';
import { updatePlaylistDescription, updatePlaylistRating, deletePlaylistRating } from '../../services/playlist_services';
import { getPreMadeTags, assignTagToItem, createCustomTag, searchTags, removeTagFromItem } from '../../../tags/services/tag_services';
import type { Tag } from '../../../tags/type/tag_types';
import { useError } from '../../../../context/ErrorContext';
import { useSuccess } from '../../../../context/SuccessContext';
import type { Tables } from '../../../../types/supabase';
import { supabase } from '../../../../lib/supabaseClient';

interface PlaylistReviewProps {
    playlist: Tables<'playlists'>;
    userRating: number | null;
    tags: string[];
    setTags: (tags: string[]) => void;
    onDescriptionChange?: (newDescription: string) => void;
    isEditingEnabled?: boolean;
    userName?: string;
    onTagsUpdate?: (newTags: string[]) => void;
    onRatingUpdate?: () => void;
}

export const PlaylistReview: React.FC<PlaylistReviewProps> = ({
    playlist, userRating, tags, setTags, onDescriptionChange, isEditingEnabled = true, userName = 'You', onTagsUpdate, onRatingUpdate
}) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [customTagInput, setCustomTagInput] = useState('');
    const [reviewText, setReviewText] = useState(playlist.description || '');

    useEffect(() => { setReviewText(playlist.description || ''); }, [playlist.description]);
    useEffect(() => { loadAvailableTags(); }, []);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isTagMenuOpen && !target.closest('.tag-menu-container')) setIsTagMenuOpen(false);
        };
        if (isTagMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isTagMenuOpen]);

    const loadAvailableTags = async () => {
        try {
            const tagsData = await getPreMadeTags();
            setAvailableTags(tagsData);
        } catch (error) { console.error('Error loading tags:', error); }
    };

    const handleDescriptionUpdate = async () => {
        if (reviewText === playlist.description) return;
        const oldDescription = playlist.description;
        try {
            await updatePlaylistDescription(playlist.id, reviewText);
            if (onDescriptionChange) onDescriptionChange(reviewText);
            showSuccess('Description updated');
        } catch (error) {
            console.error('Error updating description:', error);
            showError('Failed to update description');
            setReviewText(oldDescription || '');
        }
    };

    const handleAddPresetTag = async (tag: Tag) => {
        if (!playlist) return;
        if (tags.includes(tag.name)) return;
        const prevTags = [...tags];
        const newTags = [...tags, tag.name];
        setTags(newTags);
        if (onTagsUpdate) onTagsUpdate(newTags);
        setIsTagMenuOpen(false);
        try {
            await assignTagToItem(playlist.id, 'playlist', tag.id);
            showSuccess(`Tag #${tag.name} added`);
        } catch (error) {
            console.error('Error adding tag:', error);
            showError('Failed to add tag');
            setTags(prevTags);
            if (onTagsUpdate) onTagsUpdate(prevTags);
        }
    };

    const handleAddCustomTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customTagInput.trim()) {
            const tagName = customTagInput.trim();
            if (tags.includes(tagName)) { showError('Tag already added'); return; }
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { showError('Log in to add tags'); return; }
            const prevTags = [...tags];
            const optimisticTags = [...tags, tagName];
            setTags(optimisticTags);
            if (onTagsUpdate) onTagsUpdate(optimisticTags);
            setCustomTagInput('');
            try {
                const existingTags = await searchTags(tagName);
                let tagToAssign;
                if (existingTags.length > 0 && existingTags[0].name.toLowerCase() === tagName.toLowerCase()) tagToAssign = existingTags[0];
                else tagToAssign = await createCustomTag(tagName);
                await assignTagToItem(playlist.id, 'playlist', tagToAssign.id);
                showSuccess(`Tag #${tagToAssign.name} added`);
            } catch (error) {
                console.error('Error adding custom tag:', error);
                showError('Failed to add custom tag');
                setTags(prevTags);
                if (onTagsUpdate) onTagsUpdate(prevTags);
            }
        }
    };

    const handleStarClick = async (rating: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { showError('Log in to rate'); return; }
            if (userRating === rating) {
                await deletePlaylistRating(playlist.id);
                showSuccess('Rating removed');
            } else {
                await updatePlaylistRating(playlist.id, rating);
                showSuccess(`Rated ${rating}/5`);
            }
            if (onRatingUpdate) onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
            showError('Failed to update rating');
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        const prevTags = [...tags];
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        if (onTagsUpdate) onTagsUpdate(newTags);
        try {
            const existingTags = await searchTags(tagToRemove);
            const tagToDelete = existingTags.find(t => t.name === tagToRemove);
            if (tagToDelete) await removeTagFromItem(playlist.id, 'playlist', tagToDelete.id);
            showSuccess(`Tag #${tagToRemove} removed`);
        } catch (error) {
            console.error('Error removing tag:', error);
            showError('Failed to remove tag');
            setTags(prevTags);
            if (onTagsUpdate) onTagsUpdate(prevTags);
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 gap-2 overflow-hidden">
            <div className="flex items-center justify-between mb-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <div><h3 className="text-white font-bold text-lg">Rating</h3><p className="text-gray-400 text-xs">Based on {userName}</p></div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[white] cursor-pointer hover:text-gray-300 transition-colors" onClick={() => userRating !== null && handleStarClick(userRating)} title="Click to rate">{userRating !== null ? (Number.isInteger(userRating) ? userRating : userRating.toFixed(1)) : 'Not Rated'}</span>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400">{[1, 2, 3, 4, 5].map((star) => (<svg key={star} onClick={() => handleStarClick(star)} className={`w-4 h-4 cursor-pointer transition-all hover:scale-110 ${star <= (userRating || 0) ? 'fill-current' : 'text-gray-600 fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>))}</div>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">out of 5</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col min-h-[120px]">
                <p className="text-gray-400 text-xs mb-2">Description</p>
                <div className="bg-white/5 rounded-lg border border-white/5 flex-1 flex flex-col overflow-hidden"><textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} onBlur={() => { if (reviewText !== playlist?.description) { handleDescriptionUpdate(); } }} readOnly={!isEditingEnabled} placeholder={isEditingEnabled ? "Write your thoughts on this playlist..." : (playlist.description ? "" : "Creator has not provided a description.")} className={`w-full flex-1 bg-transparent text-white p-4 resize-none outline-none placeholder-gray-500 text-sm leading-relaxed ${!isEditingEnabled ? 'cursor-default' : ''}`} /></div>
            </div>
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-xs">{isEditingEnabled ? 'Personal Tags:' : 'Creator Tags:'}</p>
                    <div className="relative tag-menu-container">
                        <button onClick={() => setIsTagMenuOpen(!isTagMenuOpen)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"><MoreOptionsIcon size={14} orientation="horizontal" /></button>
                        {isTagMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="px-3 py-2 border-b border-white/5 bg-white/5">
                                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Add Tags</span>
                                </div>
                                <div className="px-3 py-2 border-b border-white/5">
                                    <input
                                        type="text"
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                        onKeyDown={handleAddCustomTag}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        placeholder="Press Enter to add"
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
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
                {/* Fixed height h-[45px] and items-start to cut the second row of tags in half */}
                <div className="bg-white/5 rounded-lg px-2 border border-white/5 h-[45px] overflow-y-auto custom-scrollbar flex items-start py-1.5">
                    {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span key={index} className="group relative text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"><span className="group-hover:opacity-0 transition-opacity">#{tag}</span><button onClick={() => handleRemoveTag(tag)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200" title="Remove tag"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></span>
                            ))}
                        </div>
                    ) : <p className="text-gray-500 text-xs italic">No tags yet</p>}
                </div>
            </div>
        </div>
    );
};