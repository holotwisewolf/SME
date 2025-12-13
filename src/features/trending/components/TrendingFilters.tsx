// TrendingFilters - Filter controls for trending content (REDESIGNED)

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TrendingFilters as TrendingFiltersType, TimeRange } from '../types/trending';

interface TrendingFiltersProps {
    filters: TrendingFiltersType;
    onFiltersChange: (filters: TrendingFiltersType) => void;
}

const TrendingFilters: React.FC<TrendingFiltersProps> = ({ filters, onFiltersChange }) => {
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    const handleResetFilters = () => {
        setSelectedTags([]);
        onFiltersChange({
            timeRange: 'week',
            sortBy: 'top-rated',
            tags: [],
        });
    };

    return (
        <div className="w-64 flex-shrink-0 bg-[#292929] border border-[#D1D1D1]/10 rounded-xl p-6 flex flex-col max-h-full shadow-lg">
            {/* Header */}
            <div className="mb-6 flex-shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[#D1D1D1] tracking-tight">Filters</h2>
                    <div className="h-0.5 w-12 bg-[#FFD1D1] mt-2 rounded-full"></div>
                </div>
                <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#FFD1D1] hover:text-[#FFD1D1]/80 transition-colors"
                >
                    Reset All
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                {/* Time Period - Changed to Dropdown */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">Time Period</label>
                    <div className="relative">
                        <select
                            value={filters.timeRange}
                            onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value as TimeRange })}
                            className="w-full bg-[#1a1a1a] border border-[#D1D1D1]/30 text-[#D1D1D1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFD1D1]/50 cursor-pointer appearance-none pr-10"
                        >
                            <option value="week" className="bg-[#1a1a1a] text-[#D1D1D1]">Past 7 Days</option>
                            <option value="month" className="bg-[#1a1a1a] text-[#D1D1D1]">Past 30 Days</option>
                            <option value="all-time" className="bg-[#1a1a1a] text-[#D1D1D1]">All Time</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#D1D1D1]/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filter by Tags - NEW */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">Filter by Tags</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type tag name..."
                            className="flex-1 bg-[#696969]/30 border border-[#D1D1D1]/20 text-[#D1D1D1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFD1D1]/50 placeholder:text-[#D1D1D1]/40"
                        />
                        <button
                            onClick={handleAddTag}
                            className="px-3 py-2 bg-[#FFD1D1] text-black rounded-lg text-sm font-medium hover:bg-[#FFD1D1]/90 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFD1D1]/20 border border-[#FFD1D1]/30 text-[#D1D1D1] text-xs rounded-full"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-[#FFD1D1] transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-[#D1D1D1]/50 mt-2">
                        {selectedTags.length === 0 ? 'No tags selected' : `${selectedTags.length} tag(s) active`}
                    </p>
                </div>

                {/* Minimum Rating */}
                <div>
                    <label className="block text-sm font-semibold text-[#D1D1D1]/80 mb-3">
                        Minimum Rating: {filters.minRating ? `${filters.minRating.toFixed(1)}+` : 'Any'}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.minRating || 0}
                        onChange={(e) => onFiltersChange({ ...filters, minRating: parseFloat(e.target.value) || undefined })}
                        className="w-full h-2 bg-[#696969]/50 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-[#D1D1D1]/50 mt-1">
                        <span>0</span>
                        <span>5</span>
                    </div>
                </div>
            </div>

            <style>{`
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
      `}</style>
        </div>
    );
};

export default TrendingFilters;
