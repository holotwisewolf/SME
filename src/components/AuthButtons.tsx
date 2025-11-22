import React from 'react';

const AuthButtons: React.FC = () => {
  return (
    <div className="flex space-x-4 flex-shrink-0">
      <button 
        className="
          bg-transparent 
          text-[#D1D1D1] 
          border border-[#888] 
          rounded-md 
          px-8 py-2.5      
          text-base font-medium
          hover:bg-[#292929]
          transition duration-150
          whitespace-nowrap 
        "
      >
        Login
      </button>
      
      <button 
        className="
          bg-[#bfbfbf]
          text-black
          font-bold
          rounded-md 
          px-8 py-2.5      
          text-base   
          hover:bg-[#ededed]
          transition duration-150
          whitespace-nowrap
        "
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthButtons;