import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarButtonProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

const ExpandSidebarButton: React.FC<SidebarButtonProps> = ({ isExpanded, toggleSidebar }) => {
    return (
        <motion.button
            onClick={toggleSidebar}
            layout
            initial={false}
            animate={{
                width: isExpanded ? 200 : 40,
                borderRadius: isExpanded ? 12 : 50,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-10 bg-black flex items-center justify-center shadow-md z-50 hover:bg-[#353537] overflow-hidden relative"
            aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
            <div className="flex items-center justify-center w-full px-2">
                {/* Icon */}
                <motion.div
                    layout
                    className="flex items-center justify-center shrink-0"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                    >
                        <g transform="rotate(-90 12 12)">
                            <path d="M18 9L12 15L6 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </motion.div>

                {/* Text Label */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-white text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                            Collapse
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.button>
    );
};

export default ExpandSidebarButton;