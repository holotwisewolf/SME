import React from 'react';

// 1. Update the interface to accept a color prop
interface ExpandButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  /** Custom stroke color for the SVG icon (e.g., '#FF0000' or 'currentColor') */
  strokeColor?: string;
  className?: string;
}

// 2. Destructure the new prop and set a default value
const ExpandButton: React.FC<ExpandButtonProps> = ({
  onClick,
  strokeColor = "#292929", // Default color for accessibility/consistency
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`group focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
      title="Expand"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
      >
        <path
          d="M10 19H5V14M14 5H19V10"
          // 3. Apply the prop to the SVG's stroke attribute
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ExpandButton;