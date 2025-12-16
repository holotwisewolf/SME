// ViewModeToggle - Toggle between dashboard and simple view modes

import React from 'react';

interface ViewModeToggleProps {
    viewMode: 'simple' | 'dashboard';
    onViewModeChange: (mode: 'simple' | 'dashboard') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex gap-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg p-1">
            <button
                onClick={() => onViewModeChange('simple')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'simple'
                        ? 'bg-[#FFD1D1] text-black'
                        : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'
                    }`}
            >
                Simple
            </button>
            <button
                onClick={() => onViewModeChange('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'dashboard'
                        ? 'bg-[#FFD1D1] text-black'
                        : 'text-[#D1D1D1]/70 hover:text-[#D1D1D1]'
                    }`}
            >
                Dashboard
            </button>
        </div>
    );
};

export default ViewModeToggle;
