// DashboardHeader - Header section with title and view mode toggle

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { logoutSpotify } from '../../../../features/spotify/services/spotify_services.ts';
import ViewModeToggle from './ViewModeToggle';

interface DashboardHeaderProps {
    viewMode: 'simple' | 'dashboard';
    onViewModeChange: (mode: 'simple' | 'dashboard') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ viewMode, onViewModeChange }) => {
    const navigate = useNavigate();

    // Handle full logout (Spotify Local + Supabase Auth)
    const handleLogout = async () => {
        try {
            // 1. Clear Spotify tokens from local storage
            logoutSpotify();

            // 2. Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // 3. Redirect to login page
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">Dashboard</h1>
                <p className="text-[#D1D1D1]/60 mt-2">Discover what's popular in the community</p>
            </div>

            <div className="flex items-center gap-4">
                <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                
                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 rounded-md transition-colors"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;