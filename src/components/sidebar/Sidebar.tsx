import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import ExpandSidebarButton from './ExpandSidebarButton';
import FavouritesIcon from '../shared/FavouritesIcon';
import folderIcon from '../../assets/folder_icon.png';
import musicIcon from '../../assets/music_icon.png';
import infoIcon from '../../assets/info_icon.png';
import SettingsIcon from '../ui/SettingsIcon';
import type { MenuItem } from './SidebarSubItem';
import { AuthService } from '../../features/auth/services/auth_services';
import { useLogin } from '../../features/auth/components/LoginProvider';

interface SidebarProps {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
    const { user, profile } = useLogin();
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        if (profile && profile.app_role === 'dev') {
            setIsDev(true);
        } else {
            setIsDev(false);
        }
    }, [profile]);

    const allMenuItems: MenuItem[] = [
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
        { path: '/testing-ground', icon: SettingsIcon, label: 'Testing Ground', requiredRole: 'dev' },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (item.requiredRole === 'dev' && !isDev) return false;
        return true;
    });

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
