import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SpotifyService } from '../../../spotify/services/spotify_services';

interface PlaylistTrackDetailModalProps {
    track: any;
    onClose: () => void;
}

export const PlaylistTrackDetailModal: React.FC<PlaylistTrackDetailModalProps> = ({ track, onClose }) => {
    const navigate = useNavigate();

    if (!track) return null;

    const image = track.album?.images?.[0]?.url;
    const name = track.name;
    const artist = track.artists?.map((a: any) => a.name).join(', ');
    const albumName = track.album?.name;
    const duration = SpotifyService.formatDuration(track.duration_ms);

    const handleArtistClick = () => {
        if (track.artists && track.artists.length > 0) {
            // Navigate to artists page with search query for the first artist
            navigate(`/artists?search=${encodeURIComponent(track.artists[0].name)}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-[#181818] rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md flex flex-col gap-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content Container */}
                    <div className="flex flex-col items-center">
                        {/* Image with shadow */}
                        <div className="w-64 h-64 rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-6">
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                    <span className="text-gray-600">No Image</span>
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="text-center w-full space-y-1 mb-6">
                            <h3 className="text-2xl font-bold text-white truncate w-full px-4" title={name}>
                                {name}
                            </h3>
                            <p
                                className="text-lg text-gray-400 truncate w-full px-4 hover:text-white hover:underline cursor-pointer transition-colors"
                                title={artist}
                                onClick={handleArtistClick}
                            >
                                {artist}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="w-full grid grid-cols-2 gap-4 mb-8 px-4">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Album</span>
                                <span className="text-sm text-gray-300 font-medium truncate block" title={albumName}>{albumName || 'Unknown'}</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Duration</span>
                                <span className="text-sm text-gray-300 font-medium block">{duration}</span>
                            </div>
                        </div>

                        {/* Spotify Button */}
                        <a
                            href={track.external_urls?.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-all hover:scale-105 shadow-lg w-full max-w-[200px]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            Play on Spotify
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
