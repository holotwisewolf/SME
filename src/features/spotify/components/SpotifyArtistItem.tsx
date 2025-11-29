import React from 'react';
import { motion } from 'framer-motion';
import type { SpotifyArtist } from '../type/spotify_types';

interface SpotifyArtistItemProps {
    artist: SpotifyArtist;
    isSelected: boolean;
    onSelect: (artist: SpotifyArtist) => void;
}

const SpotifyArtistItem: React.FC<SpotifyArtistItemProps> = ({ artist, isSelected, onSelect }) => {
    // Get smallest image for list view
    const imageUrl = artist?.images?.length > 0
        ? artist.images[artist.images.length - 1].url
        : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            onClick={() => onSelect(artist)}
        >
            {/* Artist Image (Circle) */}
            <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-[#2a2a2a]">
                {imageUrl ? (
                    <img src={imageUrl} alt={artist?.name || 'Artist'} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-gray-500 text-xs">
                        No Img
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col overflow-hidden">
                <span className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>
                    {artist?.name || 'Unknown Artist'}
                </span>
                <span className="text-xs text-gray-400 truncate capitalize">
                    {artist?.genres?.slice(0, 2).join(', ') || 'Artist'}
                </span>
            </div>
        </motion.div>
    );
};

export default SpotifyArtistItem;
