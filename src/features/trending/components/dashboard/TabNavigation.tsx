// TabNavigation - Tab navigation component for trending items

import React from 'react';

type TabType = 'tracks' | 'albums' | 'playlists';

interface Tab {
    value: TabType;
    label: string;
}

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    variant?: 'dashboard' | 'simple';
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, variant = 'dashboard' }) => {
    const tabs: Tab[] = [
        { value: 'playlists', label: 'Playlists' },
        { value: 'tracks', label: 'Tracks' },
        { value: 'albums', label: 'Albums' },
    ];

    if (variant === 'simple') {
        return (
            <div className="flex gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab.value
                                ? 'bg-[#FFD1D1] text-black shadow-lg shadow-[#FFD1D1]/20'
                                : 'bg-[#696969]/50 text-[#D1D1D1]/70 hover:bg-[#696969] hover:text-[#D1D1D1] border border-[#D1D1D1]/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${activeTab === tab.value
                            ? 'bg-[#FFD1D1] text-black border border-[#FFD1D1]'
                            : 'bg-[#1a1a1a] text-[#D1D1D1]/70 hover:text-[#D1D1D1] border border-[#D1D1D1]/20 hover:border-[#FFD1D1]/30'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
