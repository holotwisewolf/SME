import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewOnSpotifyButton } from '../../../spotify/components/ViewOnSpotifyButton';

interface PlaylistTrackDetailModalProps {
    track: any;
    onClose: () => void;
}

export const PlaylistTrackDetailModal: React.FC<PlaylistTrackDetailModalProps> = ({ track, onClose }) => {
    if (!track) return null;

    const image = track.album?.images?.[0]?.url;
    const name = track.name;
    const artist = track.artists?.map((a: any) => a.name).join(', ');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative bg-[#181818] rounded-xl shadow-2xl border border-white/10 p-6 w-[300px] flex flex-col items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image */}
                    <div className="w-40 h-40 rounded-lg overflow-hidden shadow-lg mt-2">
                        {image ? (
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                                <span className="text-gray-600">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center w-full">
                        <h3 className="text-lg font-bold text-white truncate w-full" title={name}>{name}</h3>
                        <p className="text-sm text-gray-400 truncate w-full" title={artist}>{artist}</p>
                    </div>

                    {/* Spotify Button */}
                    <div className="mt-2">
                        <a
                            href={track.external_urls?.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black transition-transform hover:scale-105 shadow-lg"
                            title="Open in Spotify"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
