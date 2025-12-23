import { useState, useEffect } from 'react';
import type { Tag } from '../../../tags/type/tag_types';
import { getPreMadeTags, assignTagToItem } from '../../../tags/services/tag_services';
import { updateItemRating, deleteItemRating } from '../../services/item_services';
import { useError } from '../../../../context/ErrorContext';
import { useSuccess } from '../../../../context/SuccessContext';
import { supabase } from '../../../../lib/supabaseClient';

export interface UseAlbumReviewProps {
    albumId: string;
    userRating: number | null;
    tags: string[];
    setTags: (tags: string[]) => void;
    onRatingUpdate: () => void;
    onUpdate?: () => void;
    initialIsTagMenuOpen?: boolean;
}

export const useAlbumReview = ({
    albumId,
    userRating,
    tags,
    setTags,
    onRatingUpdate,
    onUpdate,
    initialIsTagMenuOpen = false
}: UseAlbumReviewProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(initialIsTagMenuOpen);
    const [newTag, setNewTag] = useState('');

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
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error adding tag:', error);
            showError('Failed to add tag');
        }
    };

    const handleRatingClick = async (rating: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to rate');
                return;
            }

            if (userRating === rating) {
                // Toggle off (delete rating)
                await deleteItemRating(albumId, 'album');
                showSuccess('Rating removed');
            } else {
                await updateItemRating(albumId, 'album', rating);
                showSuccess(`Rated ${rating}/5`);
            }
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
            showError('Failed to update rating');
        }
    };

    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showError('Log in to add tags');
                return;
            }

            // CRITICAL FIX: Sanitize BEFORE checking/displaying
            const rawTag = newTag.trim();
            const sanitizedTag = rawTag.toLowerCase().replace(/[^a-z]/g, '');

            // Validate sanitized tag is not empty
            if (!sanitizedTag) {
                showError('Tag must contain at least one letter');
                setNewTag('');
                return;
            }

            // Check if sanitized tag already exists
            if (tags.includes(sanitizedTag)) {
                showError('Tag already exists');
                setNewTag('');
                return;
            }

            // Show what the tag will actually be saved as
            if (rawTag !== sanitizedTag) {
                console.log(`Tag sanitized: "${rawTag}" → "${sanitizedTag}"`);
            }

            try {
                // Use addItemTag which creates custom tag if needed and links it
                const { addItemTag } = await import('../../services/item_services');
                await addItemTag(albumId, 'album', sanitizedTag);

                // IMPORTANT: Add the SANITIZED version to UI state
                setTags([...tags, sanitizedTag]);

                setNewTag('');
                setIsTagMenuOpen(false);
                showSuccess(`Tag #${sanitizedTag} added`);
                if (onUpdate) onUpdate();
            } catch (error) {
                console.error('Error adding tag:', error);
                showError('Failed to add tag');
            }
        }
    };

    const removeTag = async (tagToRemove: string) => {
        // Optimistic update
        setTags(tags.filter(tag => tag !== tagToRemove));

        try {
            // Import dynamically just like addItemTag to avoid circular deps if needed
            const { removeItemTag } = await import('../../services/item_services');

            await removeItemTag(albumId, 'album', tagToRemove);

            if (onUpdate) onUpdate();
        } catch (e) {
            console.error('Error removing tag:', e);
            showError('Failed to remove tag');
            // Revert optimistic update
            setTags([...tags, tagToRemove]);
        }
    };

    return {
        availableTags,
        isTagMenuOpen, setIsTagMenuOpen,
        newTag, setNewTag,
        handleAddPresetTag,
        handleRatingClick,
        handleAddTag,
        removeTag
    };
};
