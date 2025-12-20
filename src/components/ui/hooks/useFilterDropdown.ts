import { useState, useEffect, useRef } from 'react';
import type { FilterState, SortOptionType } from '../FilterDropdown';

export interface UseFilterDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement>;
    currentFilter: FilterState;
    onFilterChange: (newFilter: FilterState) => void;
}

export const useFilterDropdown = ({
    isOpen,
    onClose,
    anchorRef,
    currentFilter,
    onFilterChange
}: UseFilterDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    const handleRatingChange = (val: string) => {
        let num = parseFloat(val);
        if (isNaN(num)) num = 0;

        // Ensure valid range
        if (num < 0) num = 0;
        if (num > 5) num = 5;

        // Logic: If personal mode, round to integer. If global, step is 0.5 (handled by input step mostly)
        if (currentFilter.ratingMode === 'personal') {
            num = Math.round(num);
        }

        onFilterChange({ ...currentFilter, minRating: num });
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Auto-capitalization logic for better UX
        const val = e.target.value;
        // Simple capitalization: first letter upper
        setTagInput(val.charAt(0).toUpperCase() + val.slice(1));
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        const newTag = tagInput.trim();
        if (!currentFilter.selectedTags.includes(newTag)) {
            onFilterChange({ ...currentFilter, selectedTags: [...currentFilter.selectedTags, newTag] });
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onFilterChange({ ...currentFilter, selectedTags: currentFilter.selectedTags.filter(t => t !== tagToRemove) });
    };

    const toggleRatingMode = () => {
        const newMode = currentFilter.ratingMode === 'global' ? 'personal' : 'global';

        // Reset rating to integer if switching to personal to avoid confusing state (e.g. 3.5 -> 4)
        let newRating = currentFilter.minRating;
        if (newMode === 'personal') {
            newRating = Math.round(newRating);
        }

        onFilterChange({ ...currentFilter, ratingMode: newMode, minRating: newRating });
    };

    const toggleTagMode = () => onFilterChange({ ...currentFilter, tagMode: currentFilter.tagMode === 'global' ? 'personal' : 'global' });

    return {
        dropdownRef,
        tagInput,
        setTagInput,
        handleRatingChange,
        handleTagInputChange,
        handleAddTag,
        handleRemoveTag,
        toggleRatingMode,
        toggleTagMode
    };
};
