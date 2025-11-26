import React, { useState } from 'react';
import SearchButton from '../ui/SearchButton';
import ClearButton from '../ui/ClearButton';
import AnimatedDropdown from '../ui/AnimatedDropdown';

const SearchBar: React.FC = () => {
  // State to handle the input value
  const [searchText, setSearchText] = useState('');
  // State to handle the selected search type
  const [searchType, setSearchType] = useState('Tracks');

  // Function to clear the search text
  const handleClear = () => {
    setSearchText('');
  };

  return (
    <div className="flex-1 max-w-[600px] min-w-[200px]">
      <div className="relative flex items-center w-full h-12">
        {/* THE WRAPPER */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          <SearchButton />
        </div>

        {/* --- CLEAR BUTTON (Right, only shows when text exists) --- */}
        {searchText && (
          <button
            onClick={handleClear}
            // Position: right-32 (approx 128px) puts it to the left of the dropdown
            className="absolute right-32 top-1/2 -translate-y-1/2 z-20 p-1 
            rounded-full 
            hover:bg-white/20
            hover:scale-110 
            transition-all 
            focus:outline-none"
            title="Clear Search"
          >
            <ClearButton />
          </button>
        )}

        <input
          type="text"
          placeholder="Search in here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full h-full bg-[#555555] text-white placeholder-gray-300 rounded-full pl-12 pr-36 border border-white focus:outline-none focus:ring-1 focus:ring-white transition"
        />

        <div className="absolute right-1.5 top-1 bottom-1">
          <AnimatedDropdown
            options={["Tracks", "Artists", "Albums"]}
            value={searchType}
            onChange={setSearchType}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;