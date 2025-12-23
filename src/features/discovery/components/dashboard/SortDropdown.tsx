// SortDropdown - Dropdown for sorting trending items

import React from 'react';
import type { SortBy } from '../../types/discovery';
import { StyledDropdown } from '../../../../components/ui/StyledDropdown';

interface SortDropdownProps {
    sortBy: SortBy;
    onSortChange: (sortBy: SortBy) => void;
    activeTab?: 'tracks' | 'albums' | 'playlists';
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange, activeTab = 'playlists' }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-[#D1D1D1]/60">Sort by:</span>

            {/* 1. Wrap in a relative div to position the icon */}
            <div className="relative z-30">
                <StyledDropdown
                    value={sortBy}
                    onChange={(value: unknown) => onSortChange(value as SortBy)}
                    options={[
                        { value: 'trending', label: 'Trending' },
                        { value: 'top-rated', label: 'Top Rated' },
                        { value: 'most-ratings', label: 'Most Ratings' },
                        { value: 'most-commented', label: 'Most Comments' },
                        { value: 'most-favorited', label: 'Most Favorited' },
                        { value: 'most-activity', label: 'Recent Activity' },
                        { value: 'newly-tagged', label: 'Newly Tagged' },
                        ...(activeTab === 'playlists' ? [{ value: 'recently-created', label: 'Recently Created' }] : [])
                    ] as any} // Cast to any to avoid strict type checking on mixed array conditions if needed, or better, define options separately
                />
            </div>
        </div>
    );
};

export default SortDropdown;