import React from 'react';
import type { TrendingFilters as TrendingFiltersType, TimeRange } from '../types/trending';
import { MoreOptionsIcon } from '../../../components/ui/MoreOptionsIcon';
import { useTrendingFilters } from '../hooks/useTrendingFilters';

interface TrendingFiltersProps {
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
}

const TrendingFilters: React.FC<TrendingFiltersProps> = ({ filters, onFiltersChange }) => {
    const {
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
    } = useTrendingFilters(filters, onFiltersChange);

    return (
        <div className="w-64 flex-shrink-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-5 flex flex-col h-full shadow-lg">
            {/* Header */}
            <div className="mb-4 flex-shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-[#D1D1D1] tracking-tight">Filters</h2>
                    <div className="h-0.5 w-8 bg-[#FFD1D1] mt-1 rounded-full"></div>
                </div>
                <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#FFD1D1] hover:text-[#FFD1D1]/80 transition-colors"
                >
                    Reset
                </button>
            </div>

            <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                {/* Filter by Name */}
                <div>
                    <label className="block text-xs font-semibold text-[#D1D1D1]/80 mb-1.5">Filter by Name</label>
                    <input
                        type="text"
                        value={filters.searchQuery || ''}
                        onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value || undefined })}
                        placeholder="Search by name..."
                        className="w-full bg-[#696969]/30 border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#FFD1D1]/50 placeholder:text-[#D1D1D1]/40"
                    />
                </div>

                {/* Time Period */}
                <div>
                    <label className="block text-xs font-semibold text-[#D1D1D1]/80 mb-1.5">Time Period</label>
                    <div className="relative">
                        <select
                            value={filters.timeRange}
                            onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value as TimeRange })}
                            className="w-full bg-[#1a1a1a] border border-[#D1D1D1]/30 text-[#D1D1D1] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer appearance-none pr-8"
                        >
                            <option value="week" className="bg-[#1a1a1a] text-[#D1D1D1]">Past 7 Days</option>
                            <option value="month" className="bg-[#1a1a1a] text-[#D1D1D1]">Past 30 Days</option>
                            <option value="all-time" className="bg-[#1a1a1a] text-[#D1D1D1]">All Time</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#D1D1D1]/50">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filter by Tags */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#D1D1D1]/80">Filter by Tags</label>
                        <div className="relative tag-menu-container">
                            <button
                                onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                                className="p-1 hover:bg-[#D1D1D1]/10 rounded-full transition-colors text-[#D1D1D1]/60 hover:text-[#D1D1D1]"
                            >
                                <MoreOptionsIcon size={12} orientation="horizontal" />
                            </button>

                            {isTagMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-[#2a2a2a] border border-[#D1D1D1]/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-2.5 py-1.5 border-b border-[#D1D1D1]/5 bg-[#D1D1D1]/5">
                                        <span className="text-xs font-bold text-[#D1D1D1]/80 uppercase tracking-wider">Pre-seeded Tags</span>
                                    </div>

                                    <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                        {availableTags.filter(t => !selectedTags.includes(t.name)).length > 0 ? (
                                            availableTags
                                                .filter(t => !selectedTags.includes(t.name))
                                                .map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleAddPresetTag(tag)}
                                                        className="w-full text-left px-2.5 py-1.5 text-sm text-[#D1D1D1]/80 hover:bg-[#D1D1D1]/10 hover:text-[#D1D1D1] transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD1D1]"></span>
                                                        {tag.name}
                                                    </button>
                                                ))
                                        ) : (
                                            <div className="px-2.5 py-1.5 text-xs text-[#D1D1D1]/50 italic">
                                                All tags already selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tag Input Field */}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter tag names"
                        className="w-full bg-[#696969]/30 border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#FFD1D1]/50 placeholder:text-[#D1D1D1]/40"
                    />

                    {/* Selected Tags Container - Always Visible */}
                    <div className="mt-1.5 p-1.5 bg-[#1a1a1a] border border-[#D1D1D1]/10 rounded-lg min-h-[32px] flex items-center">
                        {selectedTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {selectedTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="group relative text-xs bg-[#FFD1D1]/20 border border-[#FFD1D1]/30 text-[#D1D1D1] px-1.5 py-0.5 rounded-full hover:bg-[#FFD1D1]/30 transition-colors cursor-pointer"
                                    >
                                        <span className="group-hover:opacity-0 transition-opacity">#{tag}</span>
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
                                            title="Remove tag"
                                        >
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-[#D1D1D1]/40 text-xs italic">No current filtered tags</span>
                        )}
                    </div>
                </div>

                {/* Minimum Rating */}
                <div>
                    <label className="block text-xs font-semibold text-[#D1D1D1]/80 mb-1.5">
                        Min Rating: {filters.minRating ? `${filters.minRating}+` : 'Any'}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={filters.minRating || 0}
                        onChange={(e) => onFiltersChange({ ...filters, minRating: parseInt(e.target.value) || undefined })}
                        className="w-full h-1.5 bg-[#696969]/50 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[#D1D1D1]/50 mt-0.5">
                        <span>0</span>
                        <span>5</span>
                    </div>
                </div>

                {/* Minimum Number of Ratings */}
                <div>
                    <label className="block text-xs font-semibold text-[#D1D1D1]/80 mb-1.5">
                        Min User Ratings
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="999"
                        value={filters.minRatingCount || ''}
                        onChange={handleMinRatingCountChange}
                        placeholder="Any"
                        className="w-full bg-[#696969]/30 border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#FFD1D1]/50 placeholder:text-[#D1D1D1]/40 number-input-no-spinner"
                    />
                </div>
            </div>

            <style>{`
        /* Hide scrollbar but keep scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #696969;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD1D1;
          border-radius: 3px;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFD1D1;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFD1D1;
          cursor: pointer;
          border: none;
        }
        /* Hide number input spinner buttons */
        .number-input-no-spinner::-webkit-outer-spin-button,
        .number-input-no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .number-input-no-spinner[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
        </div>
    );
};

export default TrendingFilters;
