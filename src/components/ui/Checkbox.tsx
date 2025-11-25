import React, { useState } from "react";

interface AnimatedCheckboxProps {
    checked?: boolean;
    onChange?: (value: boolean) => void;
    label?: string;
    className?: string;
}

const Checkbox: React.FC<AnimatedCheckboxProps> = ({
    checked,
    onChange,
    label = "Remember me",
    className = "",
}) => {
    // internal fallback state if no parent state is used
    const [internalChecked, setInternalChecked] = useState(false);

    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleToggle = () => {
        if (onChange) {
            onChange(!isChecked);
        } else {
            setInternalChecked(!isChecked);
        }
    };

    return (
        <label
            className={`flex items-center space-x-3 cursor-pointer group select-none ${className}`}
        >
            <div className="relative w-6 h-6">
                {/* Hidden native checkbox */}
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={handleToggle}
                />

                {/* Unchecked box */}
                <div
                    className={`absolute inset-0 text-gray-400 transition-all duration-300 ease-out group-hover:text-gray-200
          ${isChecked ? "opacity-0 scale-50 rotate-180" : "opacity-100 scale-100 rotate-0"}
        `}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V7.19691C20 6.07899 20 5.5192 19.7822 5.0918C19.5905 4.71547 19.2837 4.40973 18.9074 4.21799C18.4796 4 17.9203 4 16.8002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Checked box */}
                <div
                    className={`absolute inset-0 text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isChecked ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-180"}
        `}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M8 12L11 15L16 9M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {/* Label */}
            <span
                className={`transition-colors duration-300 ${isChecked ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                    }`}
            >
                {label}
            </span>
        </label>
    );
};

export default Checkbox;
