import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import type { MenuItem } from './SidebarSubItem';

interface SidebarMenuProps {
    isExpanded: boolean;
    menuItems: MenuItem[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isExpanded, menuItems }) => {
    const location = useLocation();
    const activePath = location.pathname;
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleSubMenu = (label: string) => {
        if (expandedMenu === label) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(label);
        }
    };

    React.useEffect(() => {
        if (!isExpanded) {
            setExpandedMenu(null);
        } else {
            // Auto-expand if active path is a subitem
            const activeItem = menuItems.find(item =>
                item.subItems?.some(sub => sub.path === activePath)
            );
            if (activeItem) {
                setExpandedMenu(activeItem.label);
            }
        }
    }, [isExpanded]);

    const itemVariants = {
        expanded: { paddingLeft: '0.75rem', justifyContent: 'flex-start' },
        collapsed: { paddingLeft: '0.75rem', justifyContent: 'flex-start' }
    };

    return (
        <nav className="flex-1 pt-8 pb-6">
            <ul className="space-y-6">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        item={item}
                        isExpanded={isExpanded}
                        activePath={activePath}
                        expandedMenu={expandedMenu}
                        toggleSubMenu={toggleSubMenu}
                        itemVariants={itemVariants}
                    />
                ))}
            </ul>
        </nav>
    );
};

export default SidebarMenu;
