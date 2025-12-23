import { useState, useEffect } from 'react';
import type { DiscoveryFilters as DiscoveryFiltersType, TimeRange } from '../types/discovery';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import { getPreMadeTags } from '../../tags/services/tag_services';
import type { Tag } from '../../tags/type/tag_types';

export const useDiscoveryFilters = (
    filters: DiscoveryFiltersType,
    onFiltersChange: (filters: DiscoveryFiltersType) => void
) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    // Local state
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    // Load pre-seeded tags
    useEffect(() => {
        loadAvailableTags();
    }, []);

    // Sync selectedTags with filters.tags when filters change externally (e.g., from sidebar)
    useEffect(() => {
        if (filters.tags && JSON.stringify(filters.tags) !== JSON.stringify(selectedTags)) {
            setSelectedTags(filters.tags);
        }
    }, [filters.tags]);

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

    const handleAddPresetTag = (tag: Tag) => {
        if (!selectedTags.includes(tag.name)) {
            const newTags = [...selectedTags, tag.name];
            setSelectedTags(newTags);
            onFiltersChange({ ...filters, tags: newTags });
            setIsTagMenuOpen(false);
            showSuccess(`Tag #${tag.name} added to filter`);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
            const newTags = [...selectedTags, tagInput.trim()];
            setSelectedTags(newTags);
            onFiltersChange({ ...filters, tags: newTags });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = selectedTags.filter(tag => tag !== tagToRemove);
        setSelectedTags(newTags);
        onFiltersChange({ ...filters, tags: newTags });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTag();
        }
    };

    const handleMinRatingCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty string
        if (value === '') {
            onFiltersChange({ ...filters, minRatingCount: undefined });
            return;
        }

        // Validate that it's only digits (no letters, symbols, etc.)
        if (!/^\d+$/.test(value)) {
            showError('Please enter only numbers');
            return;
        }

        const numValue = parseInt(value);
        if (numValue < 0) {
            showError('Minimum user ratings cannot be negative');
            return;
        }

        onFiltersChange({ ...filters, minRatingCount: numValue });
    };

    const handleResetFilters = () => {
        setSelectedTags([]);
        onFiltersChange({
            timeRange: 'week',
            sortBy: 'top-rated',
            tags: [],
        });
    };

    return {
        tagInput, setTagInput,
        selectedTags,
        isTagMenuOpen, setIsTagMenuOpen,
        availableTags,
        handleAddPresetTag,
        handleAddTag,
        handleRemoveTag,
        handleKeyPress,
        handleMinRatingCountChange,
        handleResetFilters
    };
};
