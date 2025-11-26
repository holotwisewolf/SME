import React from 'react';

const AscendingButton = ({
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
                <path
                    d="M0 5H3L3 16H5L5 5L8 5V4L4 0L0 4V5Z"
                    fill={color}
                />
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

export default AscendingButton;