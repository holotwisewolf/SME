import React from 'react';
import { motion } from 'framer-motion';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import ExpandSidebarButton from './ExpandSidebarButton';
import FavoritesIcon from '../shared/FavoritesIcon';
import folderIcon from '../../assets/folder_icon.png';
import musicIcon from '../../assets/music_icon.png';
import infoIcon from '../../assets/info_icon.png';
import type { MenuItem } from './SidebarSubItem';

interface SidebarProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
    const menuItems: MenuItem[] = [
        {
            path: '/library/playlists',
            icon: folderIcon,
            label: 'Library',
            subItems: [
                { path: '/library/playlists', icon: folderIcon, label: 'Playlists' },
                { path: '/library/tracks', icon: musicIcon, label: 'Tracks' },
                { path: '/library/albums', icon: musicIcon, label: 'Albums' }
            ]
        },
        {
            path: '/favorites/playlists',
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
            <SidebarLogo isExpanded={isExpanded} />

            {/* Navigation Items */}
            <SidebarMenu isExpanded={isExpanded} menuItems={menuItems} />
        </motion.aside>
    );
};

export default Sidebar;
