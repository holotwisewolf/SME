import React from 'react';

const ExpandButton: React.FC = () => {
  return (
    <button 
      className="group focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
      title="Expand"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        // Matching size w-7 h-7 (28px) with other buttons
        className="w-7 h-7"
      >
        <path 
          d="M10 19H5V14M14 5H19V10" 
          stroke="#292929" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ExpandButton;