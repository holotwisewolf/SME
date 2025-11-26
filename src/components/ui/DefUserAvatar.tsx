import React from 'react';

const DefUserAvatar = ({
    className = "w-6 h-6",
    color = "currentColor",
    ...props
}: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            className={className}
            {...props}
        >
            <title>user-profile-circle-solid</title>
            <g id="Layer_2" data-name="Layer 2">
                <g id="icons_Q2" data-name="icons Q2">
                    <path
                        d="M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2Zm0,8a8,8,0,1,1-8,8A8,8,0,0,1,24,10Zm0,32a18.2,18.2,0,0,1-12.2-4.8A26.4,26.4,0,0,1,24,34a26.4,26.4,0,0,1,12.2,3.2A18.2,18.2,0,0,1,24,42Z"
                        fill={color}
                    />
                </g>
            </g>
        </svg>
    );
};

export default DefUserAvatar;