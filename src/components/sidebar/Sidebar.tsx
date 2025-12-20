import React from 'react';
import { motion } from 'framer-motion';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import ExpandSidebarButton from './ExpandSidebarButton';
import { useAppSidebar } from './hooks/useAppSidebar';

interface SidebarProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
    const { menuItems } = useAppSidebar();

    // Animation variants to keep code clean
    const sidebarVariants = {
        expanded: { width: 250 },
        collapsed: { width: 80 }
    };

    return (
        <motion.aside
            initial={false}
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={sidebarVariants}
            className="relative h-screen bg-[#2a2a2e] flex flex-col z-30 overflow-visible rounded-br-[20px]"
        >
            {/* FIXED LOGO SECTION */}
            <SidebarLogo isExpanded={isExpanded} />

            {/* Navigation Items */}
            <SidebarMenu isExpanded={isExpanded} menuItems={menuItems} />

            {/* Expand/Collapse Button */}
            <div className="mb-8 flex justify-center shrink-0">
                <ExpandSidebarButton isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
            </div>
        </motion.aside>
    );
};

export default Sidebar;
