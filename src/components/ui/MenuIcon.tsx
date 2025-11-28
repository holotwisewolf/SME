import React from 'react';

const MenuIcon = ({
    className = "w-6 h-6",
    color = "currentColor",
    ...props
}: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} transition-none will-change-auto`}
            style={{ transition: 'none' }}
            {...props}
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'none' }}
                />
            </g>
        </svg>
    );
};

export default MenuIcon;