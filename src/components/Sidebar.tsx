import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloudLogo from './CloudLogo';
import ExpandSidebarButton from './ExpandSidebarButton';
import folderIcon from '../assets/folder_icon.png';
import musicIcon from '../assets/music_icon.png';
import infoIcon from '../assets/info_icon.png';

interface SidebarProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
    const location = useLocation();
    const activePath = location.pathname;

    const menuItems = [
        { path: '/library', icon: folderIcon, label: 'Library' },
        { path: '/songs', icon: musicIcon, label: 'Songs' },
        { path: '/Info', icon: infoIcon, label: 'Info' },
    ];

    // Animation variants to keep code clean
    const sidebarVariants = {
        expanded: { width: 250 },
        collapsed: { width: 80 }
    };

    const itemVariants = {
        expanded: { paddingLeft: '0.75rem', justifyContent: 'flex-start' },
        collapsed: { paddingLeft: '0.75rem', justifyContent: 'flex-start' }
    };

    return (
        <motion.aside
            initial={false}
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={sidebarVariants}
            className="relative h-screen bg-[#2a2a2e] border-[white] flex flex-col z-50 overflow-visible rounded-br-2xl"
        >
            {/* Expand/Collapse Button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <ExpandSidebarButton isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
            </div>

            {/* FIXED LOGO SECTION */}
            <div className="h-20 border-b border-[#42434a] bg-[#18181b] flex items-center relative overflow-hidden">

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

            {/* Navigation Items */}
            <nav className="flex-1 pt-10 pb-6">
                <ul className="space-y-6">
                    {menuItems.map((item) => {
                        const isActive = activePath === item.path || (item.path === '/library' && activePath === '/');
                        return (
                            <li key={item.label} className="px-3">
                                <Link
                                    to={item.path}
                                >
                                    <motion.div
                                        variants={itemVariants}
                                        className={`flex items-center h-12 px-3 rounded-lg transition-colors duration-200 group ${isActive ? 'bg-[#444444] text-white' : 'text-[#e6e6ef] hover:bg-[#525252]'
                                            }`}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                            <img
                                                src={item.icon}
                                                alt={item.label}
                                                className={`w-full h-full object-contain transition-all duration-200 ${isActive
                                                    ? 'brightness-200 invert-0'
                                                    : 'invert opacity-80 group-hover:opacity-100'
                                                    }`}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto', marginLeft: 16 }}
                                                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="font-medium whitespace-nowrap overflow-hidden text-sm"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </Link>
                                {/* Tooltip for collapsed state */}
                                {!isExpanded && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
