import React from 'react';

interface LoadingSpinnerProps extends React.SVGProps<SVGSVGElement> {
    /**
     * Controls whether the spinner is visible and spinning.
     * Defaults to true.
     */
    active?: boolean;
}

const LoadingSpinner = ({
    active = true,
    className = "w-6 h-6",
    color = "currentColor",
    ...props
}: LoadingSpinnerProps) => {
    // If not active, we don't render anything (or you could render a static icon)
    if (!active) return null;

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            // animate-spin is a standard Tailwind class for infinite rotation
            className={`animate-spin ${className}`}
            {...props}
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M20.0001 12C20.0001 13.3811 19.6425 14.7386 18.9623 15.9405C18.282 17.1424 17.3022 18.1477 16.1182 18.8587C14.9341 19.5696 13.5862 19.9619 12.2056 19.9974C10.825 20.0328 9.45873 19.7103 8.23975 19.0612"
                    stroke={color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
};

export default LoadingSpinner;