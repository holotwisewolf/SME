import React from "react";

const InputGroup = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col gap-5 w-full">{children}</div>;
};

{/* Footer: Remember + Forgot Password */ }
<div className="flex items-center justify-between mt-4 select-none">

    {/* Remember Me */}
    <label className="flex items-center gap-2 text-gray-300 cursor-pointer group">
        <input
            type="checkbox"
            className="
                appearance-none 
                size-4 rounded-sm 
                bg-[#2b2b2b] 
                border border-gray-600 
                checked:bg-[#FFD1D1] 
                checked:border-[#FFD1D1] 
                transition-all duration-150
                group-hover:border-[#f8baba]
            "
        />
        <span className="text-sm text-gray-300 group-hover:text-white transition">
            Remember me
        </span>
    </label>

    {/* Forgot Password */}
    <button className="text-sm text-gray-400 hover:text-white transition">
        Forgot password?
    </button>
</div>

export default InputGroup;
