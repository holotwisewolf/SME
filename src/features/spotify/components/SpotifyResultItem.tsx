import React from 'react';
import { motion } from 'framer-motion';
import { SpotifyService } from '../services/spotify_services';
import type { SpotifyTrack } from '../type/spotify_types';

interface SpotifyResultItemProps {
    track: SpotifyTrack;
    isSelected: boolean;
    onSelect: (track: SpotifyTrack) => void;
}

const SpotifyResultItem: React.FC<SpotifyResultItemProps> = ({ track, isSelected, onSelect }) => {
    // Get smallest image for list view
    const imageUrl = track.album.images.length > 0
        ? track.album.images[track.album.images.length - 1].url
        : ''; // Fallback placeholder could be added

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            onClick={() => onSelect(track)}
        >
            {/* Album Art */}
            <div className="relative w-12 h-12 rounded overflow-hidden bg-[#2a2a2a]">
                {imageUrl && (
                    <img src={imageUrl} alt={track.album.name} className="w-full h-full object-cover" />
                )}
                {/* Play Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>

            {/* Info - Grid column that can shrink */}
            <div className="flex flex-col min-w-0">
                <span className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>
                    {track.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                    {track.artists.map(a => a.name).join(', ')}
                </span>
            </div>

            {/* Metadata - Grid column that won't shrink */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="hidden sm:block truncate max-w-[100px]">{track.album.name}</span>
                <span className="whitespace-nowrap">{SpotifyService.formatDuration(track.duration_ms)}</span>
            </div>
        </motion.div>
    );
};

export default SpotifyResultItem;
