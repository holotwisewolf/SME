import { useState, useEffect } from 'react';
import { updatePlaylistDescription, updatePlaylistRating, deletePlaylistRating } from '../services/playlist_services';
import { getPreMadeTags, assignTagToItem, searchTags, removeTagFromItem } from '../../tags/services/tag_services';
import type { Tag } from '../../tags/type/tag_types';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import type { Tables } from '../../../types/supabase';
import { supabase } from '../../../lib/supabaseClient';

export interface UsePlaylistReviewProps {
    playlist: Tables<'playlists'>;
    userRating: number | null;
    tags: string[];
    setTags: (tags: string[]) => void;
    onDescriptionChange?: (newDescription: string) => void;
    onTagsUpdate?: (newTags: string[]) => void;
    onRatingUpdate?: () => void;
    initialIsTagMenuOpen?: boolean;
}

export const usePlaylistReview = ({
    playlist,
    userRating,
    tags,
    setTags,
    onDescriptionChange,
    onTagsUpdate,
    onRatingUpdate,
    initialIsTagMenuOpen = false
}: UsePlaylistReviewProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(initialIsTagMenuOpen);
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { showError('Log in to add tags'); return; }

            // CRITICAL FIX: Sanitize BEFORE checking/displaying
            const rawTag = customTagInput.trim();
            const sanitizedTag = rawTag.toLowerCase().replace(/[^a-z]/g, '');

            // Validate sanitized tag is not empty
            if (!sanitizedTag) {
                showError('Tag must contain at least one letter');
                setCustomTagInput('');
                return;
            }

            // Character limit validation
            if (sanitizedTag.length > 20) {
                showError('Tag must be 20 characters or less');
                return;
            }

            // Check if sanitized tag already exists
            if (tags.includes(sanitizedTag)) {
                showError('Tag already added');
                setCustomTagInput('');
                return;
            }

            // Show what the tag will actually be saved as
            if (rawTag !== sanitizedTag) {
                console.log(`Tag sanitized: "${rawTag}" → "${sanitizedTag}"`);
            }

            const prevTags = [...tags];
            const optimisticTags = [...tags, sanitizedTag];
            setTags(optimisticTags);
            if (onTagsUpdate) onTagsUpdate(optimisticTags);
            setCustomTagInput('');

            try {
                // Use addItemTag which creates custom tag if needed and links it
                const { addItemTag } = await import('../../favourites/services/item_services');
                await addItemTag(playlist.id, 'playlist', sanitizedTag);
                showSuccess(`Tag #${sanitizedTag} added`);
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
            // Use shared service that handles name->id lookup and removal
            const { removeItemTag } = await import('../../favourites/services/item_services');
            await removeItemTag(playlist.id, 'playlist', tagToRemove);

            showSuccess(`Tag #${tagToRemove} removed`);
        } catch (error) {
            console.error('Error removing tag:', error);
            showError('Failed to remove tag');
            setTags(prevTags);
            if (onTagsUpdate) onTagsUpdate(prevTags);
        }
    };

    return {
        availableTags,
        isTagMenuOpen, setIsTagMenuOpen,
        customTagInput, setCustomTagInput,
        reviewText, setReviewText,
        handleDescriptionUpdate,
        handleAddPresetTag,
        handleAddCustomTag,
        handleStarClick,
        handleRemoveTag
    };
};
