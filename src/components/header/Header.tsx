import React from 'react';
import SpotifySearchBar from '../../features/spotify/components/SpotifySearchBar';
import AuthButtons from '../../features/auth/components/AuthButtons';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-[#18181b] flex items-center justify-between px-8 border-b border-[#42434a] gap-4">
      <SpotifySearchBar />
      <AuthButtons />
    </header>
  );
};

export default Header;