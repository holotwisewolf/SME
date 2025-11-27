import React from 'react';
import { motion } from 'framer-motion';
import type { SpotifyAlbum } from '../types';

interface SpotifyAlbumItemProps {
    album: SpotifyAlbum;
    isSelected: boolean;
    onSelect: (album: SpotifyAlbum) => void;
}

const SpotifyAlbumItem: React.FC<SpotifyAlbumItemProps> = ({ album, isSelected, onSelect }) => {
    // Get smallest image for list view
    const imageUrl = album.images.length > 0
        ? album.images[album.images.length - 1].url
        : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            onClick={() => onSelect(album)}
        >
            {/* Album Art */}
            <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-[#2a2a2a]">
                {imageUrl && (
                    <img src={imageUrl} alt={album.name} className="w-full h-full object-cover" />
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col overflow-hidden">
                <span className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>
                    {album.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                    {album.artists.map(a => a.name).join(', ')} • {album.release_date.split('-')[0]}
                </span>
            </div>
        </motion.div>
    );
};

export default SpotifyAlbumItem;
