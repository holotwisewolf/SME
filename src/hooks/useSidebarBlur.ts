import { useEffect } from 'react';

export const useSidebarBlur = (isOpen: boolean) => {
    useEffect(() => {
        const sidebarElement = document.getElementById('app-sidebar');
        
        if (sidebarElement) {
            if (isOpen) {

                sidebarElement.style.filter = 'blur(4px) brightness(0.5)';
                sidebarElement.style.pointerEvents = 'none';
                sidebarElement.style.zIndex = '0'; // 关键：让位给弹窗
                sidebarElement.style.transition = 'all 0.3s ease'; 
            } else {

                sidebarElement.style.filter = '';
                sidebarElement.style.pointerEvents = '';
                sidebarElement.style.zIndex = '50';
                sidebarElement.style.transition = 'all 0.3s ease';
            }
        }

        return () => {
            if (sidebarElement) {
                sidebarElement.style.filter = '';
                sidebarElement.style.pointerEvents = '';
                sidebarElement.style.zIndex = '50';
            }
        };
    }, [isOpen]);
};