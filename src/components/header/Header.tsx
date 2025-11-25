import React from 'react';
import SearchBar from './SearchBar';
import AuthButtons from './AuthButtons';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-[#18181b] flex items-center justify-between px-8 border-b border-[#42434a] gap-4">
      <SearchBar />
      <AuthButtons />
    </header>
  );
};

export default Header;