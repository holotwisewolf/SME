import React from 'react';

// 1. Define the TypeScript interface for component props
interface CollapseVerticalButtonProps {
    onClick?: (e: React.MouseEvent) => void;
    /** Custom fill color for the SVG icon (e.g., '#0070f3' or 'currentColor') */
    fillColor?: string;
    className?: string;
    title?: string;
}

// 2. Use the interface and destructure the props with default values
const CollapseVerticalButton: React.FC<CollapseVerticalButtonProps> = ({
    onClick,
    fillColor = "currentColor", // Default color allows CSS color inheritance
    className = "",
    title = "Collapse"
}) => {
    return (
        <button
            onClick={onClick}
            // Added common button styling for interactivity
            className={`group focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
            title={title}
        >
            <svg
                width="24" // Set a common display size
                height="24"
                viewBox="0 0 1920 1920"
                xmlns="http://www.w3.org/2000/svg"
                // Retain the rotation to keep the "upload" direction
                style={{ transform: 'rotate(180deg)' }}
                className="w-6 h-6" // Control the rendered size
            >
                <g id="SVGRepo_iconCarrier">
                    <path
                        d="M1920 1694.176v112.942H0v-112.942h1920ZM1750.588 113C1843.991 113 1920 189.01 1920 282.412v1185.882h-112.941V282.412c0-31.06-25.412-56.47-56.47-56.47H169.411c-31.06 0-56.47 25.41-56.47 56.47v1185.882H0V282.412C0 189.009 76.01 113 169.412 113h1581.176Zm-734.117 451.765v654.268l242.371-242.485 79.963 79.963L960 1435.202l-378.805-378.691 79.963-79.963 242.371 242.485V564.765h112.942Z"
                        // 3. Use the fillColor prop instead of a hardcoded value
                        fill={fillColor}
                        fillRule="evenodd"
                    />
                </g>
            </svg>
        </button>
    );
};

export default CollapseVerticalButton;