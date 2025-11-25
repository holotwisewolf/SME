import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloudLogo from './CloudLogo';
import ExpandSidebarButton from './ExpandSidebarButton';
import FavoritesIcon from './FavoritesIcon';
import folderIcon from '../assets/folder_icon.png';
import musicIcon from '../assets/music_icon.png';
import infoIcon from '../assets/info_icon.png';

interface SidebarProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

interface MenuItem {
    path: string;
    icon: string | React.FC<{ className?: string }>;
    label: string;
    subItems?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
    const location = useLocation();
    const activePath = location.pathname;
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleSubMenu = (label: string) => {
        if (expandedMenu === label) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(label);
        }
    };

    const menuItems: MenuItem[] = [
        {
            path: '/library',
            icon: folderIcon,
            label: 'Library',
        },
        {
            path: '/favorites',
            icon: FavoritesIcon,
            label: 'Favorites',
            subItems: [
                { path: '/favorites/playlists', icon: folderIcon, label: 'Playlists' },
                { path: '/favorites/tracks', icon: musicIcon, label: 'Tracks' },
                { path: '/favorites/albums', icon: musicIcon, label: 'Albums' }
            ]
        },
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
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isMenuExpanded = expandedMenu === item.label;

                        return (
                            <li key={item.label} className="px-3">
                                <div
                                    className="relative"
                                >
                                    <Link
                                        to={item.path}
                                        className="block"
                                    >
                                        <motion.div
                                            variants={itemVariants}
                                            className={`flex items-center h-12 px-3 rounded-lg transition-colors duration-200 group relative ${isActive ? 'bg-[#525252] text-white' : 'text-[#e6e6ef] hover:bg-[#444444]'
                                                }`}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center shrink-0 relative">
                                                {typeof item.icon === 'string' ? (
                                                    <img
                                                        src={item.icon}
                                                        alt={item.label}
                                                        className={`w-full h-full object-contain transition-all duration-200 ${isActive
                                                            ? 'brightness-200 invert-0'
                                                            : 'invert opacity-80 group-hover:opacity-100'
                                                            }`}
                                                    />
                                                ) : (
                                                    // Render component icon
                                                    React.createElement(item.icon, {
                                                        className: `w-full h-full ${isActive ? 'text-white' : 'text-gray-400'}`
                                                    })
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: 'auto', marginLeft: 16 }}
                                                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="font-medium whitespace-nowrap overflow-hidden text-sm flex-1"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {/* Dropdown Button */}
                                            {hasSubItems && isExpanded && (
                                                <div
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleSubMenu(item.label);
                                                    }}
                                                    className={`
                                                        w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ml-2
                                                        hover:bg-white group/btn
                                                    `}
                                                >
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`w-4 h-4 transition-transform duration-300 ${isMenuExpanded ? 'rotate-180' : 'rotate-0'} stroke-gray-400 group-hover/btn:stroke-black`}
                                                    >
                                                        <path d="M6 9L12 15L18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </motion.div>
                                    </Link>
                                </div>

                                {/* Sub-items */}
                                <AnimatePresence>
                                    {hasSubItems && isExpanded && isMenuExpanded && (
                                        <motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 mt-1 space-y-1"
                                        >
                                            {item.subItems!.map((subItem) => {
                                                const isSubActive = activePath === subItem.path;
                                                return (
                                                    <li key={subItem.label}>
                                                        <Link to={subItem.path}>
                                                            <div className={`flex items-center h-10 px-3 rounded-lg transition-colors duration-200 ${isSubActive ? 'bg-[#525252] text-white' : 'text-[#e6e6ef] hover:bg-[#444444]'}`}>
                                                                <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-3">
                                                                    {/* Render Component Icon */}
                                                                    {typeof subItem.icon === 'string' ? (
                                                                        <img src={subItem.icon} alt="" className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        React.createElement(subItem.icon, { className: "w-full h-full" })
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium">{subItem.label}</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>

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
