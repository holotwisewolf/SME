import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="flex bg-[#696969] min-h-screen text-[#e6e6ef] font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#696969]">
                {/* 
            The main content area will take up the remaining space.
            We can add a Header here if needed, or just render children.
            For now, we render children which will be the PageWrapper + Page Content.
        */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
