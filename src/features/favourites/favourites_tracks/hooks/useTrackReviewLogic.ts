import { useState, useEffect } from 'react';
import { getPreMadeTags, assignTagToItem } from '../../../tags/services/tag_services';
import type { Tag } from '../../../tags/type/tag_types';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';
import { useSuccess } from '../../../../context/SuccessContext';
import { useError } from '../../../../context/ErrorContext';

export interface UseTrackReviewLogicProps {
    track: SpotifyTrack;
    tags: string[];
    setNewTag: (tag: string) => void;
    handleAddTag: (e: React.KeyboardEvent) => void;
    isTagMenuOpen: boolean;
    setIsTagMenuOpen: (open: boolean) => void;
}

export const useTrackReviewLogic = ({
    track,
    tags,
    setNewTag,
    handleAddTag,
    isTagMenuOpen,
    setIsTagMenuOpen
}: UseTrackReviewLogicProps) => {
    const { showSuccess } = useSuccess();
    const { showError } = useError();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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
    }, [isTagMenuOpen, setIsTagMenuOpen]);

    const loadAvailableTags = async () => {
        try {
            const tagsData = await getPreMadeTags();
            setAvailableTags(tagsData);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    };

    const handleAddPresetTag = async (tag: Tag) => {
        if (!track) return;
        try {
            await assignTagToItem(track.id, 'track' as 'track' | 'album' | 'playlist', tag.id);
            // Optimistic update - add tag name to tags array
            if (!tags.includes(tag.name)) {
                // Directly add to tags via parent's state
                const event = {
                    key: 'Enter',
                    preventDefault: () => { }
                } as React.KeyboardEvent;
                setNewTag(tag.name);
                handleAddTag(event);
            }
            setIsTagMenuOpen(false);
            showSuccess(`Tag #${tag.name} added`);
        } catch (error) {
            console.error('Error adding tag:', error);
            showError('Failed to add tag');
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        availableTags,
        handleAddPresetTag,
        formatDuration
    };
};
