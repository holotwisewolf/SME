// DashboardHeader - Header section with title and view mode toggle

import React from 'react';
import ViewModeToggle from './ViewModeToggle';

interface DashboardHeaderProps {
    viewMode: 'simple' | 'dashboard';
    onViewModeChange: (mode: 'simple' | 'dashboard') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">Dashboard</h1>
                <p className="text-[#D1D1D1]/60 mt-2">Discover what's popular in the community</p>
            </div>

            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        </div>
    );
};

export default DashboardHeader;