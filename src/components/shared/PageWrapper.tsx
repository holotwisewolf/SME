import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
    children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
    return (
        <motion.div
            className="h-full overflow-y-auto scrollbar-hide"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
                duration: 0.22,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {children}
        </motion.div>

    );
};

export default PageWrapper;
