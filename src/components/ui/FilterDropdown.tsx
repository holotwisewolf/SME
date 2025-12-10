import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ isOpen, onClose, anchorRef }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, anchorRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-[#2a2a2a] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50"
                >
                    {/* Filter Section */}
                    <div className="p-3 border-b border-white/10">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                            Filter
                        </h3>
                        <div className="space-y-1">
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                All Items
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Recently Added
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Favorites
                            </button>
                        </div>
                    </div>

                    {/* Sort By Section */}
                    <div className="p-3">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                            Sort By
                        </h3>
                        <div className="space-y-1">
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Name (A-Z)
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Name (Z-A)
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Date Added
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors">
                                Custom Order
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FilterDropdown;
