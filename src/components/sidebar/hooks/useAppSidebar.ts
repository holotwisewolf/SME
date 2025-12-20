import { useState, useEffect } from 'react';
import { useLogin } from '../../../features/auth/components/LoginProvider';
import folderIcon from '../../../assets/folder_icon.png';
import musicIcon from '../../../assets/music_icon.png';
import infoIcon from '../../../assets/info_icon.png';
import SettingsIcon from '../../ui/SettingsIcon';
import FavouritesIcon from '../../shared/FavouritesIcon';
import { LayoutDashboard, Activity, Sparkles } from 'lucide-react';
import type { MenuItem } from '../SidebarSubItem';

export const useAppSidebar = () => {
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
            path: '/discovery/dashboard',
            icon: FavouritesIcon,
            label: 'Discovery',
            subItems: [
                { path: '/discovery/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { path: '/discovery/community-activity', icon: Activity, label: 'Community Activity' },
                { path: '/discovery/for-you', icon: Sparkles, label: 'For You' }
            ]
        },
        { path: '/Info', icon: infoIcon, label: 'Info' },
        { path: '/testing-ground', icon: SettingsIcon, label: 'Testing Ground', requiredRole: 'dev' },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (item.requiredRole === 'dev' && !isDev) return false;
        return true;
    });

    return {
        menuItems
    };
};
