import React from 'react';
import { Link } from 'react-router-dom';

export interface MenuItem {
    path: string;
    icon: string | React.FC<{ className?: string }>;
    label: string;
    subItems?: MenuItem[];
    requiredRole?: 'dev' | 'user';
}

interface SidebarSubItemProps {
    subItem: MenuItem;
    activePath: string;
}

const SidebarSubItem: React.FC<SidebarSubItemProps> = ({ subItem, activePath }) => {
    const isSubActive = activePath === subItem.path;

    return (
        <li>
            <Link to={subItem.path}>
                <div className={`flex items-center h-10 px-3 rounded-lg transition-colors duration-200 ${isSubActive ? 'bg-[#525252] text-white' : 'text-[#e6e6ef] hover:bg-[#444444]'}`}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-3">
                        {/* Render Component Icon */}
                        {typeof subItem.icon === 'string' ? (
                            <img src={subItem.icon} alt="" className="w-full h-full object-contain" />
                        ) : (
                            React.createElement(subItem.icon, { className: "w-full h-full" })
                        )}
                    </div>
                    <span className="text-sm font-medium">{subItem.label}</span>
                </div>
            </Link>
        </li>
    );
};

export default SidebarSubItem;
