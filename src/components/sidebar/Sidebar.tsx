import React from 'react';
import { motion } from 'framer-motion';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import ExpandSidebarButton from './ExpandSidebarButton';
import FavouritesIcon from '../shared/FavouritesIcon';
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
            path: '/favourites/playlists',
            icon: FavouritesIcon,
            label: 'Favourites',
            subItems: [
                { path: '/favourites/playlists', icon: folderIcon, label: 'Playlists' },
                { path: '/favourites/tracks', icon: musicIcon, label: 'Tracks' },
                { path: '/favourites/albums', icon: musicIcon, label: 'Albums' }
            ]
        },
        { path: '/songs', icon: musicIcon, label: 'Songs' },
        { path: '/Info', icon: infoIcon, label: 'Info' },
        { path: '/testing-ground', icon: infoIcon, label: 'Testing Ground' },
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
