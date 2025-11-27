import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyResultItem from './SpotifyResultItem';
import SpotifyAlbumItem from './SpotifyAlbumItem';
import SpotifyArtistItem from './SpotifyArtistItem';
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../types';

type SearchType = 'Tracks' | 'Albums' | 'Artists';

interface SpotifyResultListProps {
    results: any[];
    type: SearchType;
    selectedIndex: number;
    onSelect: (item: any) => void;
    isLoading: boolean;
}

const SpotifyResultList: React.FC<SpotifyResultListProps> = ({ results, type, selectedIndex, onSelect, isLoading }) => {
    if (results.length === 0 && !isLoading) return null;

    return (
        <AnimatePresence>
            {(results.length > 0 || isLoading) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[20rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                >
                    {isLoading && results.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Searching Spotify...
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {results.map((item, index) => {
                                const isSelected = index === selectedIndex;
                                if (type === 'Tracks') {
                                    return (
                                        <SpotifyResultItem
                                            key={item.id}
                                            track={item as SpotifyTrack}
                                            isSelected={isSelected}
                                            onSelect={onSelect}
                                        />
                                    );
                                } else if (type === 'Albums') {
                                    return (
                                        <SpotifyAlbumItem
                                            key={item.id}
                                            album={item as SpotifyAlbum}
                                            isSelected={isSelected}
                                            onSelect={onSelect}
                                        />
                                    );
                                } else {
                                    return (
                                        <SpotifyArtistItem
                                            key={item.id}
                                            artist={item as SpotifyArtist}
                                            isSelected={isSelected}
                                            onSelect={onSelect}
                                        />
                                    );
                                }
                            })}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpotifyResultList;
