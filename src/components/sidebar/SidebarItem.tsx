import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarSubItem, { type MenuItem } from './SidebarSubItem';

interface SidebarItemProps {
    item: MenuItem;
    isExpanded: boolean;
    activePath: string;
    expandedMenu: string | null;
    toggleSubMenu: (label: string) => void;
    itemVariants: any;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    isExpanded,
    activePath,
    expandedMenu,
    toggleSubMenu,
    itemVariants
}) => {
    const isSubItemActive = item.subItems?.some(sub => sub.path === activePath);
    const isActive = activePath === item.path || (item.path === '/library' && activePath === '/') || isSubItemActive;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isMenuExpanded = expandedMenu === item.label;

    const [isHovered, setIsHovered] = useState(false);

    return (
        <li
            className="px-3 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative">
                <Link to={item.path} className="block">
                    <motion.div
                        variants={itemVariants}
                        className={`flex items-center h-12 px-3 rounded-lg transition-colors duration-200 group relative ${isActive ? 'bg-[#525252] text-white' : 'text-[#e6e6ef] hover:bg-[#444444]'}`}
                    >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 relative">
                            {typeof item.icon === 'string' ? (
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    className={`w-full h-full object-contain transition-all duration-200 ${isActive
                                        ? 'brightness-200'
                                        : 'opacity-80 group-hover:opacity-100'
                                        }`}
                                />
                            ) : (
                                // Render component icon
                                React.createElement(item.icon, {
                                    className: `w-full h-full ${isActive ? 'text-white' : 'text-gray-400'}`
                                })
                            )}
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto', marginLeft: 16 }}
                                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="font-medium whitespace-nowrap overflow-hidden text-sm flex-1"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/* Dropdown Button */}
                        {hasSubItems && isExpanded && (
                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleSubMenu(item.label);
                                }}
                                className={`
                                    w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer mt-1 ml-2
                                    hover:bg-white group/btn
                                `}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-4 h-4 transition-transform duration-300 ${isMenuExpanded ? 'rotate-180' : 'rotate-0'} stroke-gray-400 group-hover/btn:stroke-black`}
                                >
                                    <path d="M6 9L12 15L18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </motion.div>
                </Link>
            </div>

            {/* Sub-items (Expanded Mode) */}
            <AnimatePresence>
                {hasSubItems && isExpanded && isMenuExpanded && (
                    <motion.ul
                        initial={{ maxHeight: 0, opacity: 0 }}
                        animate={{ maxHeight: 200, opacity: 1 }}
                        exit={{ maxHeight: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden mt-2 space-y-1 pl-4"
                    >
                        {item.subItems!.map((subItem) => (
                            <SidebarSubItem
                                key={subItem.label}
                                subItem={subItem}
                                activePath={activePath}
                                isCollapsed={false}
                            />
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>

            {/* Sub-items Popover (Collapsed Mode) */}
            {!isExpanded && isHovered && hasSubItems && (
                <div className="absolute left-full top-0 pl-2 z-50 w-max">
                    <div className="bg-[#1e1e1e] border border-white/10 shadow-xl rounded-lg p-2 min-w-[180px]">
                        <div className="text-xs font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wider">
                            {item.label}
                        </div>
                        <div className="space-y-1">
                            {item.subItems!.map((subItem) => (
                                <Link
                                    key={subItem.label}
                                    to={subItem.path}
                                    className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${subItem.path === activePath
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {typeof subItem.icon === 'string' ? (
                                        <img src={subItem.icon} alt={subItem.label} className="w-4 h-4 object-contain" />
                                    ) : (
                                        React.createElement(subItem.icon, { className: "w-4 h-4" })
                                    )}
                                    <span className="text-sm font-medium">{subItem.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tooltip for collapsed state (Only if no sub-items) */}
            {!isExpanded && !hasSubItems && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                </div>
            )}
        </li>
    );
};

export default SidebarItem;
