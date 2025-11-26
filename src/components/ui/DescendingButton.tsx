import React from 'react';

const DescendingButton = ({
    className = "w-4 h-4",
    color = "currentColor",
    ...props
}: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                {/* Arrow flipped upside down (pointing down) */}
                <path
                    d="M0 11H3V0H5V11H8V12L4 16L0 12V11Z"
                    fill={color}
                />
                {/* Bars remain the same */}
                <path
                    d="M16 16H10V14H16V16Z"
                    fill={color}
                />
                <path
                    d="M10 12H14V10H10V12Z"
                    fill={color}
                />
                <path
                    d="M12 8H10V6H12V8Z"
                    fill={color}
                />
            </g>
        </svg>
    );
};

export default DescendingButton;