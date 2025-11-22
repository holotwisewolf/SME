import React from 'react';
import SearchButton from './SearchButton';

const SearchBar: React.FC = () => {
  return (
    <div className="flex-1 max-w-[600px] min-w-[200px]">
      <div className="relative flex items-center w-full h-12">
        {/* THE WRAPPER */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        <SearchButton />      
        </div>
        <input
          type="text"
          placeholder="Search in here"
          className="w-full h-full bg-[#555555] text-white placeholder-gray-300 rounded-full pl-12 pr-36 border border-white focus:outline-none focus:ring-1 focus:ring-white transition"
        />

        <div className="absolute right-1.5 top-1 bottom-1">
          <select 
            className="
              h-full 
              w-28
              bg-[#333]
              text-gray-200 
              text-xs 
              font-medium
              text-center 
              rounded-full
              border border-gray-600 
              focus:outline-none 
              hover:bg-black/60 
              cursor-pointer
              appearance-none
            "
            style={{ textAlignLast: 'center' }}
          >
            <option>Tracks</option>
            <option>Artists</option>
            <option>Albums</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;