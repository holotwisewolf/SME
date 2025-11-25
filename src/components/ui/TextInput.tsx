import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, className = "", ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-gray-300 text-sm font-medium px-1">
                    {label}
                </label>
            )}

            <input
                {...props}
                className={`
          w-full bg-[#3b3b3b] text-white placeholder-gray-500
          rounded-xl px-4 py-3.5 
          focus:ring-2 focus:ring-gray-500/60 
          outline-none transition
          ${className}
        `}
            />
        </div>
    );
};

export default TextInput;
