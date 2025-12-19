import React from 'react';

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
    value,
    onChange,
    placeholder = "Search..."
}) => {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-[#292929] text-white text-sm rounded-full px-4 py-2 pr-8 border border-white/60 focus:border-white/90 focus:shadow-[0_0_8px_rgba(255,255,255,0.3)] focus:outline-none w-48 transition-all"

                // Prevent drag behavior to allow text selection
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            />
            {/* Clear button - only visible when there's text */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-2.5 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchField;
