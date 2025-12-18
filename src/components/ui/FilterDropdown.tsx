import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Search, Globe, User, Plus, Star, Heart, RotateCcw } from 'lucide-react';

// --- Types (Extended with granular options) ---
export type SortOptionType = 
    | 'created_at'        
    | 'alphabetical'      
    // Comments
    | 'comment_count'     
    | 'commented_at'      
    // Global Ratings
    | 'global_rating_avg'    
    | 'global_rating_count'
    | 'global_rated_at'
    // Personal Ratings
    | 'personal_rating'      
    | 'personal_rated_at'
    // Global Tags
    | 'global_tag_count'     
    | 'global_tagged_at'
    // Personal Tags
    | 'personal_tag_count'
    | 'personal_tagged_at'
    | 'custom';           

export interface FilterState {
    ratingMode: 'global' | 'personal';
    minRating: number; 
    tagMode: 'global' | 'personal';
    selectedTags: string[];
    onlyFavorites: boolean;
}

interface FilterDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement>;
    currentFilter: FilterState;
    currentSort: SortOptionType;
    onFilterChange: (newFilter: FilterState) => void;
    onSortChange: (newSort: SortOptionType) => void;
    onClearAll: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    isOpen, onClose, anchorRef, currentFilter, currentSort, onFilterChange, onSortChange, onClearAll
}) => {
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

    // --- Handlers ---

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

    // --- Components ---

    const ModeToggle = ({ mode, onToggle }: { mode: 'global' | 'personal', onToggle: () => void }) => (
        <div className="flex bg-black/40 p-1 rounded-lg mb-2">
            <button onClick={mode === 'personal' ? onToggle : undefined} className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] rounded-md transition-all ${mode === 'global' ? 'bg-[#FFD1D1] text-black font-bold shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><Globe size={10} /> Global</button>
            <button onClick={mode === 'global' ? onToggle : undefined} className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] rounded-md transition-all ${mode === 'personal' ? 'bg-[#FFD1D1] text-black font-bold shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><User size={10} /> Personal</button>
        </div>
    );

    const SortItem = ({ label, value, isSubItem = false }: { label: string, value: SortOptionType, isSubItem?: boolean }) => (
        <button onClick={() => { onSortChange(value); onClose(); }} className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${isSubItem ? 'pl-6 text-gray-400' : 'text-gray-200'} ${currentSort === value ? 'text-[#FFD1D1] font-bold bg-white/5' : 'hover:bg-white/5'}`}>
            <span>{label}</span>
            {currentSort === value && <Check className="w-3 h-3 text-[#FFD1D1]" />}
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div ref={dropdownRef} initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }} className="absolute right-0 top-12 w-72 bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 flex flex-col max-h-[65vh]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#252525]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filters</span>
                        <button onClick={onClearAll} className="text-xs text-[#FFD1D1] hover:text-white transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar p-3 space-y-5">
                        
                        {/* 1. Rating Filter */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs text-gray-300 font-medium flex items-center gap-1"><Star size={12} /> Min Rating</label>
                                {/* Display Value Only */}
                                <span className="text-[10px] text-[#FFD1D1] font-mono font-bold">
                                    {currentFilter.minRating > 0 ? `${currentFilter.minRating.toFixed(currentFilter.ratingMode === 'global' ? 1 : 0)} / 5` : 'Any'}
                                </span>
                            </div>
                            
                            <ModeToggle mode={currentFilter.ratingMode} onToggle={toggleRatingMode} />

                            <div className="flex items-center gap-3">
                                {/* Slider with Dynamic Step */}
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="5" 
                                    step={currentFilter.ratingMode === 'global' ? 0.5 : 1} 
                                    value={currentFilter.minRating}
                                    onChange={(e) => handleRatingChange(e.target.value)}
                                    className="
                                        flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer
                                        
                                        /* Webkit (Chrome, Safari, Edge) Thumb Styles */
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:w-3.5
                                        [&::-webkit-slider-thumb]:h-3.5
                                        [&::-webkit-slider-thumb]:rounded-full
                                        [&::-webkit-slider-thumb]:bg-[#FFD1D1]
                                        
                                        /* Firefox Thumb Styles */
                                        [&::-moz-range-thumb]:w-3.5
                                        [&::-moz-range-thumb]:h-3.5
                                        [&::-moz-range-thumb]:rounded-full
                                        [&::-moz-range-thumb]:bg-[#FFD1D1]
                                        [&::-moz-range-thumb]:border-none
                                    "
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/5"></div>

                        {/* 2. Tag Filter */}
                        <div>
                            <label className="text-xs text-gray-300 font-medium block mb-2">Tags</label>
                            <ModeToggle mode={currentFilter.tagMode} onToggle={toggleTagMode} />
                            
                            <div className="relative flex items-center mb-2">
                                <Search className="absolute left-2 w-3.5 h-3.5 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={tagInput} 
                                    onChange={handleTagInputChange} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} 
                                    placeholder="Type tag name..." 
                                    className="flex-1 bg-[#121212] border border-white/10 rounded-l-md py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-[#FFD1D1] transition-colors" 
                                />
                                <button onClick={handleAddTag} className="bg-[#FFD1D1] text-black px-3 py-1.5 rounded-r-md hover:bg-white transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[24px]">
                                {currentFilter.selectedTags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FFD1D1]/10 text-[#FFD1D1] border border-[#FFD1D1]/20 text-[10px] animate-in fade-in zoom-in duration-200">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                {currentFilter.selectedTags.length === 0 && <span className="text-[10px] text-gray-600 italic">No tags selected</span>}
                            </div>
                        </div>

                        <div className="border-t border-white/5"></div>

                        {/* 3. Favorites */}
                        <button onClick={() => onFilterChange({ ...currentFilter, onlyFavorites: !currentFilter.onlyFavorites })} className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${currentFilter.onlyFavorites ? 'bg-[#FFD1D1]/10 border-[#FFD1D1] text-[#FFD1D1]' : 'bg-[#121212] border-white/10 text-gray-400 hover:border-white/30'}`}>
                            <span className="text-xs font-medium flex items-center gap-2"><Heart className={`w-3.5 h-3.5 ${currentFilter.onlyFavorites ? 'fill-current' : ''}`} /> Show Favorites Only</span>
                            {currentFilter.onlyFavorites && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="border-t border-white/10 my-2"></div>

                        {/* Sort Section */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</h3>
                            
                            <div className="space-y-0.5">
                                {/* Basic */}
                                <SortItem label="Alphabetical Order" value="alphabetical" />
                                <SortItem label="Time (Date Added)" value="created_at" />
                                
                                <div className="py-1"></div>
                                {/* Rating Group */}
                                <p className="text-[10px] text-[#FFD1D1] font-mono mb-1 pl-1 opacity-70">RATING</p>
                                <SortItem label="Highest Global Rating" value="global_rating_avg" isSubItem />
                                <SortItem label="Highest Personal Rating" value="personal_rating" isSubItem />
                                <SortItem label="Most Rated" value="global_rating_count" isSubItem />
                                <SortItem label="Recently Rated (Global)" value="global_rated_at" isSubItem />
                                <SortItem label="Recently Rated (You)" value="personal_rated_at" isSubItem />

                                <div className="py-1"></div>
                                {/* Tag Group */}
                                <p className="text-[10px] text-[#FFD1D1] font-mono mb-1 pl-1 opacity-70">TAGS</p>
                                <SortItem label="Most Tags (Global)" value="global_tag_count" isSubItem />
                                <SortItem label="Most Tags (You)" value="personal_tag_count" isSubItem />
                                <SortItem label="Recently Tagged (Global)" value="global_tagged_at" isSubItem />
                                <SortItem label="Recently Tagged (You)" value="personal_tagged_at" isSubItem />

                                <div className="py-1"></div>
                                {/* Comment Group */}
                                <p className="text-[10px] text-[#FFD1D1] font-mono mb-1 pl-1 opacity-70">COMMENTS</p>
                                <SortItem label="Most Commented" value="comment_count" isSubItem />
                                <SortItem label="Recently Commented" value="commented_at" isSubItem />
                                
                                <div className="border-t border-white/5 my-1"></div>
                                {/* Custom */}
                                <SortItem label="Custom Order" value="custom" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FilterDropdown;