import React from 'react';
import { motion, type Transition, type Variants } from 'framer-motion';

// 1. Define the BASE animation for a single dot (what it does)
const dotAnimation: Variants = {
    // The "animate" state for the child dot
    animate: {
        // Keyframes: Move Y position up/down and pulse opacity
        y: ["0%", "-50%", "0%"],
        opacity: [0.6, 1, 0.6],
        transition: {
            // This transition applies to the individual dot animation
            duration: 0.6, // Shortened duration for a quicker bounce
            ease: "easeInOut",
            repeat: Infinity,
            // We set repeatDelay to match the staggered time, ensuring a smooth loop 
            // across the whole group of dots (3 dots * 0.2s stagger = 0.6s)
            repeatDelay: 0.6,
        },
    },
};

// 2. Define the CONTAINER variant (how the children are sequenced)
const containerVariants: Variants = {
    // The state we'll target with animate="start"
    start: {
        transition: {
            // Stagger the start of each child animation by 0.2 seconds
            staggerChildren: 0.2,
        },
    },
};


export function AnimatedLoadingDots({ color = 'currentColor', size = 24 }) {

    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: size, height: size }}

            // Apply the container variant to the parent
            variants={containerVariants}

            // Start the staggering animation defined in the "start" variant
            animate="start"
        >
            <g>
                {/* The individual path elements now only need to reference the dotAnimation variant.
                  Framer Motion automatically applies the stagger delay from the parent.
                  The `animate` prop is now removed from the children.
                */}

                {/* Dot 1: Left */}
                <motion.path
                    d="M5 14C5 14.5523 5.44772 15 6 15C6.55228 15 7 14.5523 7 14C7 13.4477 6.55228 13 6 13C5.44772 13 5 13.4477 5 14Z"
                    stroke={color}
                    strokeWidth="2"
                    variants={dotAnimation}
                />

                {/* Dot 2: Center */}
                <motion.path
                    d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
                    stroke={color}
                    strokeWidth="2"
                    variants={dotAnimation}
                />

                {/* Dot 3: Right */}
                <motion.path
                    d="M17 10C17 10.5523 17.4477 11 18 11C18.5523 11 19 10.5523 19 10C19 9.44772 18.5523 9 18 9C17.4477 9 17 9.44772 17 10Z"
                    stroke={color}
                    strokeWidth="2"
                    variants={dotAnimation}
                />
            </g>
        </motion.svg>
    );
}

export default AnimatedLoadingDots;