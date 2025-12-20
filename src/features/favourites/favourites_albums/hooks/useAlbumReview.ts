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
}

export const useAlbumReview = ({
    albumId,
    userRating,
    tags,
    setTags,
    onRatingUpdate
}: UseAlbumReviewProps) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
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

            const tagToAdd = newTag.trim();
            if (tags.includes(tagToAdd)) {
                showError('Tag already exists');
                return;
            }

            try {
                // Use addItemTag which creates custom tag if needed and links it
                const { addItemTag } = await import('../../services/item_services');
                await addItemTag(albumId, 'album', tagToAdd);
                setTags([...tags, tagToAdd]);
                setNewTag('');
                setIsTagMenuOpen(false);
                showSuccess(`Tag #${tagToAdd} added`);
            } catch (error) {
                console.error('Error adding tag:', error);
                showError('Failed to add tag');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
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
