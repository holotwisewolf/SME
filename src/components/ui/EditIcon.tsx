import React from 'react';

const EditIcon = ({
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
            <path
                d="M13 0L16 3L9 10H6V7L13 0Z"
                fill={color}
            />
            <path
                d="M1 1V15H15V9H13V13H3V3H7V1H1Z"
                fill={color}
            />
        </svg>
    );
};

export default EditIcon;