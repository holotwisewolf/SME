import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption<T> {
    value: T;
    label: string;
    icon?: React.ReactNode;
    count?: number;
}

interface StyledDropdownProps<T> {
    label?: string;
    value: T;
    options: DropdownOption<T>[];
    onChange: (value: T) => void;
    className?: string;
    dropdownWidth?: string;
}

export function StyledDropdown<T extends string | number>({
    label,
    value,
    options,
    onChange,
    className = '',
    dropdownWidth = 'w-56'
}: StyledDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    // Safe check if selectedOption is found
    if (!selectedOption) {
        return null;
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#D1D1D1]/5 hover:border-[#FFD1D1]/20 rounded-xl transition-all duration-300 group shadow-sm"
            >
                {label && <span className="text-[#D1D1D1]/60 text-sm font-medium mr-1">{label}:</span>}

                {selectedOption.icon && <span className="text-[#D1D1D1]">{selectedOption.icon}</span>}

                <span className={`font-medium text-sm ${label ? 'text-[#D1D1D1]' : 'text-white'}`}>
                    {selectedOption.label}
                </span>

                {selectedOption.count !== undefined && selectedOption.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#FFD1D1]/10 text-[#FFD1D1]">
                        {selectedOption.count}
                    </span>
                )}

                <ChevronDown
                    className={`w-4 h-4 text-[#D1D1D1]/60 group-hover:text-[#FFD1D1] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute right-0 top-full mt-2 ${dropdownWidth} bg-[#181818]/95 backdrop-blur-xl border border-[#D1D1D1]/10 rounded-xl shadow-2xl overflow-hidden z-[100]`}
                    >
                        <div className="p-1 space-y-0.5">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={String(option.value)}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isSelected
                                            ? 'bg-[#FFD1D1]/10 text-[#FFD1D1] font-medium'
                                            : 'text-[#D1D1D1]/70 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {option.icon && <span>{option.icon}</span>}
                                            <span>{option.label}</span>
                                        </div>
                                        {option.count !== undefined && option.count > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#FFD1D1]/20' : 'bg-white/5'
                                                }`}>
                                                {option.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StyledDropdown;
