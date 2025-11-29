import React from 'react';

interface MoreOptionsIconProps {
    className?: string;
    size?: number; // Optional prop for width/height
    colorClass?: string; // Optional prop for Tailwind color class (e.g., 'text-gray-400')
    orientation?: 'vertical' | 'horizontal';
}

/**
 * Three vertical dots icon (Kebab Menu) for "More Options".
 */
export function MoreOptionsIcon({
    className = '',
    size = 20,
    colorClass = 'text-gray-400 hover:text-white',
    orientation = 'vertical'
}: MoreOptionsIconProps) {
    return (
        <svg
            className={`${className} w-${size} h-${size} ${colorClass} ${orientation === 'horizontal' ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            // Use style for explicit size if `size` is not a standard Tailwind size
            style={{ width: size, height: size }}
        >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
    );
}

export default MoreOptionsIcon;