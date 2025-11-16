// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-[#696969] flex items-center justify-between px-6 border-b border-[#292929]">
      <div className="w-1/3">
        <input
          type="text"
          placeholder="Search in here"
          className="bg-[#292929] text-[#D1D1D1] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#D1F3FF]"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-lg font-mono text-[#FFD1D1]">07:05:58</span>
        {/* === START: Transparent Bordered Button === */}
        <button 
          className="
            bg-transparent 
            text-[#D1D1D1] 
            border border-[#D1D1D1] 
            rounded-md 
            px-4 py-2 
            hover:bg-white 
            hover:bg-opacity-10 
            transition duration-150
          "
        >
          My Action
        </button>
        {/* === END: Transparent Bordered Button === */}
        <button className="text-[#D1D1D1] hover:text-white">Login</button>
        <button className="bg-[#BAFFB5] text-[#292929] font-bold rounded-md px-4 py-2 hover:bg-opacity-90">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;