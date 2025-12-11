// TrendingFilters - Filter and sort controls for trending content

import React from 'react';
import { motion } from 'framer-motion';
import type { TimeRange, SortBy, TrendingFilters as TrendingFiltersType } from '../types/trending';

interface TrendingFiltersProps {
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
}

const TrendingFilters: React.FC<TrendingFiltersProps> = ({ filters, onFiltersChange }) => {
    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'all-time', label: 'All Time' },
    ];

    const sortOptions: { value: SortBy; label: string }[] = [
        { value: 'top-rated', label: 'Top Rated' },
        { value: 'most-ratings', label: 'Most Ratings' },
        { value: 'most-commented', label: 'Most Commented' },
        { value: 'recently-commented', label: 'Recently Commented' },
        { value: 'newly-tagged', label: 'Newly Tagged' },
    ];

    const handleTimeRangeChange = (timeRange: TimeRange) => {
        onFiltersChange({ ...filters, timeRange });
    };

    const handleSortChange = (sortBy: SortBy) => {
        onFiltersChange({ ...filters, sortBy });
    };

    const handleMinRatingChange = (minRating: number) => {
        onFiltersChange({ ...filters, minRating });
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl p-6 space-y-6">
            {/* Time Range Selector */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Time Period
                </h3>
                <div className="flex gap-2">
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => handleTimeRangeChange(range.value)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.timeRange === range.value
                                    ? 'bg-[#FFD1D1] text-black'
                                    : 'bg-[#292929] text-gray-400 hover:text-white hover:bg-[#333333]'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort By Selector */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Sort By
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${filters.sortBy === option.value
                                    ? 'bg-[#BAFFB5] text-black'
                                    : 'bg-[#292929] text-gray-400 hover:text-white hover:bg-[#333333]'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Minimum Rating Filter */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Minimum Rating
                </h3>
                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={filters.minRating || 0}
                        onChange={(e) => handleMinRatingChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[#292929] rounded-lg appearance-none cursor-pointer accent-[#FFD1D1]"
                    />
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Any</span>
                        <span className="text-white font-medium">
                            {filters.minRating ? `${filters.minRating}+` : 'Any'}
                        </span>
                        <span className="text-gray-500">10</span>
                    </div>
                </div>
            </div>

            {/* Reset Filters */}
            <button
                onClick={() => onFiltersChange({
                    timeRange: 'week',
                    sortBy: 'top-rated',
                    minRating: 0,
                })}
                className="w-full px-4 py-2 bg-[#292929] text-gray-400 hover:text-white hover:bg-[#333333] rounded-lg text-sm font-medium transition-all"
            >
                Reset Filters
            </button>
        </div>
    );
};

export default TrendingFilters;
