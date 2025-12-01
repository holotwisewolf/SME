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
    isCollapsed?: boolean;
}

const SidebarSubItem: React.FC<SidebarSubItemProps> = ({ subItem, activePath, isCollapsed = false }) => {
    const isSubActive = activePath === subItem.path;

    return (
        <li>
            <Link to={subItem.path}>
                <div
                    className={`
                        flex items-center h-10 rounded-lg transition-all duration-300 group
                        ${isCollapsed ? 'justify-center w-10 mx-auto' : 'px-3'}
                        ${isSubActive
                            ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                    title={isCollapsed ? subItem.label : undefined}
                >
                    <div className={`w-5 h-5 flex items-center justify-center shrink-0 transition-transform duration-300 ${isCollapsed ? 'group-hover:scale-110' : 'mr-3'}`}>
                        {/* Render Component Icon */}
                        {typeof subItem.icon === 'string' ? (
                            <img src={subItem.icon} alt="" className="w-full h-full object-contain" />
                        ) : (
                            React.createElement(subItem.icon, { className: "w-full h-full" })
                        )}
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium truncate">{subItem.label}</span>}
                </div>
            </Link>
        </li>
    );
};

export default SidebarSubItem;
