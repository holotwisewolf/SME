import React, { useState, useEffect, useRef } from 'react';
import { SpotifyService } from '../../features/spotify/services/spotify_services.ts';
import SpotifyResultList from '../../features/spotify/components/SpotifyResultList.tsx';
import LoadingSpinner from '../ui/LoadingSpinner';
import SearchButton from '../ui/SearchButton';
import AnimatedDropdown from '../ui/AnimatedDropdown';
import ClearButton from '../ui/ClearButton';

const HeaderSearchBar: React.FC = () => {
  const [searchType, setSearchType] = useState('Tracks');
  const [searchText, setSearchText] = useState('');

  // Search States
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce Search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchText.trim()) {
        setLoading(true);
        setIsOpen(true);
        try {
          let data = [];
          if (searchType === 'Tracks') {
            data = await SpotifyService.searchTracks(searchText, 5);
          } else if (searchType === 'Albums') {
            data = await SpotifyService.searchAlbums(searchText, 5);
          } else if (searchType === 'Artists') {
            data = await SpotifyService.searchArtists(searchText, 5);
          }
          setResults(data || []);
        } catch (error) {
          console.error("Spotify search failed", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, searchType]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item: any) => {
    console.log("Selected:", item);
    // Here you would navigate to the detail page
    // navigate(`/${searchType.toLowerCase()}/${item.id}`);
    setSearchText(""); // Optional: clear search after selection
    setIsOpen(false);
  };

  // Function to clear the search text
  const handleClear = () => {
    setSearchText('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-[600px] min-w-[200px]">
      <div className="relative flex items-center w-full h-12">
        {/* THE WRAPPER */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
          {loading ? (
            <LoadingSpinner className="w-6 h-6 text-[#1db954]" />
          ) : (
            <SearchButton />
          )}
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
          placeholder={`Search ${searchType}...`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchText.trim()) setIsOpen(true);
          }}
          className="w-full h-full bg-[#555555] text-white placeholder-gray-300 rounded-full pl-12 pr-36 border border-white focus:outline-none focus:ring-1 focus:ring-white transition"
        />

        <div className="absolute right-1.5 top-1 bottom-1">
          <AnimatedDropdown
            options={["Tracks", "Artists", "Albums"]}
            value={searchType}
            onChange={setSearchType}
          />
        </div>

        {/* Results Panel */}
        <SpotifyResultList
          results={results}
          type={searchType as any}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default HeaderSearchBar;