// SortDropdown - Dropdown for sorting trending items

import React from 'react';
import type { SortBy } from '../../types/trending';

interface SortDropdownProps {
    sortBy: SortBy;
    onSortChange: (sortBy: SortBy) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-[#D1D1D1]/60">Sort by:</span>
            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortBy)}
                className="bg-[#1a1a1a] border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer"
            >
                <option value="trending">Trending</option>
                <option value="top-rated">Top Rated</option>
                <option value="most-ratings">Most Ratings</option>
                <option value="most-commented">Most Comments</option>
                <option value="most-favorited">Most Favorited</option>
                <option value="most-activity">Recent Activity</option>
                <option value="newly-tagged">Newly Tagged</option>
                <option value="recently-created">Recently Created</option>
            </select>
        </div>
    );
};

export default SortDropdown;
