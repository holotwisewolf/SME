// ScrollIndicator - Animated scroll indicator for dashboard view

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollIndicatorProps {
    show: boolean;
    isHovering: boolean;
    onHoverChange: (hovering: boolean) => void;
    onScrollClick: () => void;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
    show,
    isHovering,
    onHoverChange,
    onScrollClick,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: show ? (isHovering ? 0.8 : 0.3) : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 cursor-pointer z-20"
            onClick={onScrollClick}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            style={{ pointerEvents: show ? 'auto' : 'none' }}
        >
            {/* Soft Glow Effect on Bottom Edge */}
            <motion.div
                animate={{ opacity: isHovering && show ? 0.3 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-2 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent blur-xl pointer-events-none"
            />

            {/* Arrow Icon */}
            <div className="flex justify-center">
                <svg viewBox="0 0 16 16" width="24" height="24" fill="white">
                    <path d="M13.2929 8.70714L8.00001 14L2.70712 8.70714L1.29291 10.1214L8.00001 16.8285L14.7071 10.1214L13.2929 8.70714Z" />
                </svg>
            </div>
        </motion.div>
    );
};

export default ScrollIndicator;
