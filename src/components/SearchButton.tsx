import React from 'react';

const SearchButton: React.FC = () => {
  return (
    <button 
      className="group focus:outline-none transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12 p-1"
      title="Search"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6" // Reduced slightly to w-6 to fit better inside the input
      >
        <path 
          d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" 
          // CHANGED: From #000000 to #FFD1D1 (Pink) or use #FFFFFF (White)
          stroke="#000000" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default SearchButton;
