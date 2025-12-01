import React from 'react';
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

    return (
        <li className="px-3">
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

            {/* Sub-items */}
            <AnimatePresence>
                {hasSubItems && (
                    (isExpanded && isMenuExpanded) || (!isExpanded && isSubItemActive)
                ) && (
                        <motion.ul
                            initial={{ maxHeight: 0, opacity: 0 }}
                            animate={{ maxHeight: 200, opacity: 1 }}
                            exit={{ maxHeight: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={`overflow-hidden mt-2 space-y-1 ${!isExpanded ? 'pl-0 flex flex-col items-center' : 'pl-4'}`}
                        >
                            {item.subItems!.map((subItem) => {
                                // If collapsed, only show the active sub-item
                                if (!isExpanded && subItem.path !== activePath) return null;

                                return (
                                    <SidebarSubItem
                                        key={subItem.label}
                                        subItem={subItem}
                                        activePath={activePath}
                                        isCollapsed={!isExpanded}
                                    />
                                );
                            })}
                        </motion.ul>
                    )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                </div>
            )}
        </li>
    );
};

export default SidebarItem;
