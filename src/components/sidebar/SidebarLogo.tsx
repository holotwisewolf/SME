import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloudLogo from '../shared/CloudLogo';

interface SidebarLogoProps {
    isExpanded: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isExpanded }) => {
    return (
        <div className="h-20 border-b border-[#42434a] bg-[#18181b] flex items-center relative overflow-hidden shrink-0">
            <div className="flex items-center w-full h-full px-4 relative">
                {/* LOGO (Stable, does not move) */}
                <motion.div
                    layout
                    initial={false}
                    animate={{
                        x: isExpanded ? 0 : 0,  // same x anchor in both modes
                        scale: isExpanded ? 1.15 : 1, // slightly larger when expanded
                    }}
                    transition={{ duration: 0.25 }}
                    className="w-12 h-12 flex items-center justify-center shrink-0"
                >
                    <CloudLogo className="w-10 h-10 text-white fill-current" />
                </motion.div>

                {/* TEXT AREA */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25 }}
                            className="ml-4 flex flex-col justify-center whitespace-nowrap"
                        >
                            <span className="text-white font-bold text-xl tracking-wide leading-none">
                                SME
                            </span>
                            <span className="text-[#6b7280] text-[10px] font-medium tracking-widest uppercase mt-1">
                                Dashboard
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SidebarLogo;
