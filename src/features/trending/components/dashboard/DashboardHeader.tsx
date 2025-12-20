// DashboardHeader - Header section with title and refresh button

import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface DashboardHeaderProps {
    onRefresh: () => void;
    refreshing?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh, refreshing = false }) => {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFD1D1]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#FFD1D1]" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight">Dashboard</h1>
                    <p className="text-[#D1D1D1]/60 mt-1">Discover what's popular in the community</p>
                </div>
            </div>

            <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-[#292929] border border-[#D1D1D1]/10 rounded-lg text-[#D1D1D1] hover:border-[#FFD1D1]/30 transition-all disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
            </button>
        </div>
    );
};

export default DashboardHeader;