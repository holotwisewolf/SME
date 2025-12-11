// TrendingFilters - Filter controls for trending content

import React from 'react';
import type { TrendingFilters as TrendingFiltersType, TimeRange, SortBy } from '../types/trending';

interface TrendingFiltersProps {
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
}

const TrendingFilters: React.FC<TrendingFiltersProps> = ({ filters, onFiltersChange }) => {
    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'all-time', label: 'All Time' },
    ];

    const sortOptions: { value: SortBy; label: string }[] = [
        { value: 'top-rated', label: 'Top Rated' },
        { value: 'most-ratings', label: 'Most Ratings' },
        { value: 'most-commented', label: 'Most Commented' },
        { value: 'most-favorited', label: 'Most Favorited' },
        { value: 'most-activity', label: 'Most Activity' },
        { value: 'recently-commented', label: 'Recently Commented' },
        { value: 'newly-tagged', label: 'Newly Tagged' },
    ];

    return (
        <div className="w-64 flex-shrink-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6 flex flex-col max-h-full shadow-lg">
            {/* Advanced Filters Title */}
            <div className="mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold text-[#D1D1D1] tracking-tight">Advanced Filters</h2>
                <div className="h-0.5 w-12 bg-[#FFD1D1] mt-2 rounded-full"></div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                {/* Time Period */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">Time Period</label>
                    <div className="flex gap-2">
                        {timeRanges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => onFiltersChange({ ...filters, timeRange: range.value })}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${filters.timeRange === range.value
                                        ? 'bg-[#FFD1D1] text-black shadow-lg shadow-[#FFD1D1]/20'
                                        : 'bg-[#696969]/50 text-[#D1D1D1]/70 hover:bg-[#696969] hover:text-[#D1D1D1] border border-[#D1D1D1]/10'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">Sort By</label>
                    <div className="space-y-1.5">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onFiltersChange({ ...filters, sortBy: option.value })}
                                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 ${filters.sortBy === option.value
                                        ? 'bg-[#FFD1D1]/15 text-[#D1D1D1] border border-[#FFD1D1]/40 shadow-sm'
                                        : 'bg-[#696969]/50 text-[#D1D1D1]/70 hover:bg-[#696969] hover:text-[#D1D1D1] border border-[#D1D1D1]/10'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minimum Rating */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">
                        Minimum Rating
                        <span className="ml-2 text-[#FFD1D1] font-bold">{filters.minRating || 0}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.minRating || 0}
                        onChange={(e) => onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-[#696969]/50 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#FFD1D1]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:shadow-[#FFD1D1]/40
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-[#FFD1D1]
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:shadow-lg
                     [&::-moz-range-thumb]:shadow-[#FFD1D1]/40"
                    />
                    <div className="flex justify-between text-xs text-[#D1D1D1]/50 mt-2">
                        <span>0</span>
                        <span>5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingFilters;
