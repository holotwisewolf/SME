// SortDropdown - Dropdown for sorting trending items

import React from 'react';
import type { SortBy } from '../../types/trending';

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
            <div className="relative">
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as SortBy)}
                    // 2. Added 'appearance-none' to hide default OS arrow
                    // 3. Added 'pr-8' (padding-right) to prevent text from overlapping the new arrow
                    className="appearance-none bg-[#1a1a1a] border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer"
                >
                    <option value="trending">Trending</option>
                    <option value="top-rated">Top Rated</option>
                    <option value="most-ratings">Most Ratings</option>
                    <option value="most-commented">Most Comments</option>
                    <option value="most-favorited">Most Favorited</option>
                    <option value="most-activity">Recent Activity</option>
                    <option value="newly-tagged">Newly Tagged</option>
                    {activeTab === 'playlists' && (
                        <option value="recently-created">Recently Created</option>
                    )}
                </select>

                {/* 4. Custom Arrow SVG - Positioned absolutely */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#D1D1D1]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SortDropdown;