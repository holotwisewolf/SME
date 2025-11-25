import React, { useState } from "react";

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    label?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    placeholder = "Password",
    className = "",
    label,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    // Enforce fallback to "password" just in case the structure ever changes
    const inputType = showPassword ? "text" : "password";

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-gray-300 text-sm font-medium px-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="
              w-full
              bg-[#3b3b3b] text-white 
              placeholder-gray-500 
              rounded-xl px-4 py-3.5 pr-12
              border border-transparent
              focus:ring-2 focus:ring-gray-500/60  
              outline-none
              transition duration-200
            "
                />

                {/* Reveal / Hide Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-gray-400 hover:text-white 
              transition 
              focus:outline-none
            "
                >
                    <div className="relative w-6 h-6">
                        {/* Eye Open */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`
                  absolute inset-0 w-6 h-6
                  transition-all duration-300 ease-in-out
                  ${showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}
                `}
                        >
                            <path
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M12 5c-4.5 0-8.2 3-9.5 7 1.3 4 5 7 9.5 7s8.2-3 9.5-7c-1.3-4-5-7-9.5-7z"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>

                        {/* Eye Closed */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`
                  absolute inset-0 w-6 h-6
                  transition-all duration-300 ease-in-out
                  ${showPassword ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}
                `}
                        >
                            <path
                                d="M3 3l18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <path
                                d="M10 5.05A7 7 0 0112 5c4.5 0 8.2 3 9.5 7-.5 1.7-1.4 3.2-2.6 4.4M6.5 6.65C4.6 7.9 3.15 9.78 2.45 12c1.3 4.06 5.1 7 9.55 7 2 0 3.85-.6 5.4-1.6"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
