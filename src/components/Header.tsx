import React from 'react';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-[#696969] flex items-center justify-between px-8 border-b border-white gap-4">
      <SearchBar />
      <AuthButtons />
    </header>
  );
};

export default Header;