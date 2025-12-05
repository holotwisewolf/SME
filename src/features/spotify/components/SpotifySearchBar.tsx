import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SpotifyService } from '../services/spotify_services';
import SpotifyResultList from './SpotifyResultList';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SearchButton from '../../../components/ui/SearchButton';
import AnimatedDropdown from '../../../components/ui/AnimatedDropdown';
import ClearButton from '../../../components/ui/ClearButton';

const SpotifySearchBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchType, setSearchType] = useState<'Tracks' | 'Albums' | 'Artists'>('Tracks');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref to track previous search type and path
  const prevSearchType = useRef(searchType);
  const prevPathname = useRef(location.pathname);

  // Debounce Search
  useEffect(() => {
    const isFullPage = ['/tracksfullpage', '/albumsfullpage', '/artistsfullpage'].includes(location.pathname);
    const typeChanged = prevSearchType.current !== searchType;
    const pathChanged = prevPathname.current !== location.pathname;

    // Update refs
    prevSearchType.current = searchType;
    prevPathname.current = location.pathname;

    // If path changed, don't trigger search/dropdown logic
    if (pathChanged) {
      return;
    }

    const shouldOpen = !isFullPage || !typeChanged;

    const timeoutId = setTimeout(async () => {
      if (searchText.trim()) {
        setLoading(true);
        if (shouldOpen) {
          setIsOpen(true);
        }
        try {
          let data: any = {};
          if (searchType === 'Tracks') {
            data = await SpotifyService.searchTracks(searchText, 5);
          } else if (searchType === 'Albums') {
            data = await SpotifyService.searchAlbums(searchText, 5);
          } else if (searchType === 'Artists') {
            data = await SpotifyService.searchArtists(searchText, 5);
          }
          setResults(data.items || []);
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
  }, [searchText, searchType, location.pathname]);

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
    setSearchText("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchText('');
    setResults([]);
    setIsOpen(false);
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'Tracks' | 'Albums' | 'Artists';
    setSearchType(newType);
    setIsOpen(false);

    // Auto-navigation logic
    const currentPath = location.pathname;
    const fullPages = ['/tracksfullpage', '/albumsfullpage', '/artistsfullpage'];

    if (fullPages.includes(currentPath)) {
      let targetPath = '';
      if (newType === 'Tracks') targetPath = '/tracksfullpage';
      else if (newType === 'Albums') targetPath = '/albumsfullpage';
      else if (newType === 'Artists') targetPath = '/artistsfullpage';

      if (targetPath && targetPath !== currentPath) {
        navigate(`${targetPath}?search=${encodeURIComponent(searchText)}`);
      }
    }
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-[600px] min-w-[200px]">
      <div className="relative flex items-center w-full h-12">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
          {loading ? <LoadingSpinner className="w-6 h-6 text-[white]" /> : <SearchButton />}
        </div>

        {searchText && (
          <button onClick={handleClear} className="absolute right-32 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full hover:bg-white/20 hover:scale-110 transition-all focus:outline-none" title="Clear Search">
            <ClearButton />
          </button>
        )}

        <input
          type="text"
          placeholder={`Search ${searchType}...`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (searchText.trim()) setIsOpen(true); }}
          className="w-full h-full bg-[#555555] text-white placeholder-gray-300 rounded-full pl-12 pr-36 border border-white focus:outline-none focus:ring-1 focus:ring-white transition"
        />

        <div
          className="absolute right-1.5 top-1 bottom-1"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <AnimatedDropdown
            options={["Tracks", "Artists", "Albums"]}
            value={searchType}
            onChange={handleTypeChange}
          />
        </div>

        <SpotifyResultList results={results} type={searchType as any} selectedIndex={selectedIndex} isLoading={loading} isOpen={isOpen} onClose={() => setIsOpen(false)} searchText={searchText} />
      </div>
    </div>
  );
};

export default SpotifySearchBar;