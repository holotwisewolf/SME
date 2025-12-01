import React from 'react';

// Define the component's props interface
interface MoveOrderIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;   // Controls the width and height
    color?: string;           // Controls the primary stroke color
}

const MoveOrderIcon: React.FC<MoveOrderIconProps> = ({
    size = 24,
    color = "#000000", // Default stroke color (Black)
    className = "",
    ...rest
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            className={className}
            {...rest}
        >
            {/* Group wrappers for the original SVG metadata (keeping them is optional) */}
            <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
            <g strokeLinecap="round" strokeLinejoin="round" id="SVGRepo_tracerCarrier"></g>

            <g id="SVGRepo_iconCarrier">
                <path
                    d="M3 5H21M10 10H21M10 14H21M3 19H21M3 9L6 12L3 15"
                    stroke={color} // Apply the color prop here
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
};

export default MoveOrderIcon;