import React from 'react';

// 1. Update the interface to accept a color prop
interface CollapseButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    /** Custom stroke color for the SVG icon (e.g., '#FF0000' or 'currentColor') */
    strokeColor?: string;
    className?: string;
}

// 2. Destructure the new prop and set a default value
const CollapseButton: React.FC<CollapseButtonProps> = ({
    onClick,
    strokeColor = "#292929", // Default color for accessibility/consistency
    className = ""
}) => {
    return (
        <button
            onClick={onClick}
            className={`group focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
            title="Collapse"
        >
            <svg
                width="48" // Setting width/height based on original SVG viewBox
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7" // Using a standard size for button icon consistency
            >
                {/* The SVG structure has been slightly simplified to remove unused carrier groups */}
                <g id="SVGRepo_iconCarrier">
                    <path
                        d="M44 20H28V4"
                        // 3. Apply the prop to the SVG's stroke attribute
                        stroke={strokeColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M4 28H20V44"
                        // 3. Apply the prop to the SVG's stroke attribute
                        stroke={strokeColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>
            </svg>
        </button>
    );
};

export default CollapseButton;