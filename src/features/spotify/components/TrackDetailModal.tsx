import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SpotifyService } from '../services/spotify_services';
import type { SpotifyTrack } from '../type/spotify_types';

interface TrackDetailModalProps {
    track: SpotifyTrack;
    onClose: () => void;
    onAddToFavourites: (trackId: string) => void;
    onAddToPlaylist: (trackId: string) => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
    track,
    onClose,
    onAddToFavourites,
    onAddToPlaylist
}) => {
    const navigate = useNavigate();

    const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
        e.stopPropagation();
        onClose();
        navigate(`/library/artists?artistId=${artistId}`);
    };

    const handleAlbumClick = (e: React.MouseEvent, albumId: string, artistId: string) => {
        e.stopPropagation();
        onClose();
        // Navigate to albums page filtered by artist and album
        navigate(`/library/albums?artistId=${artistId}&albumId=${albumId}`);
    };

    const handleSpotifyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(track.external_urls.spotify, '_blank');
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#181818] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex flex-col md:flex-row">
                        {/* Album Art */}
                        <div className="w-full md:w-80 aspect-square flex-shrink-0">
                            <img
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 flex flex-col justify-center bg-gradient-to-b from-[#2a2a2a] to-[#181818]">
                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                {track.name}
                            </h2>

                            <div className="space-y-3 mb-8">
                                {/* Artists */}
                                <div className="flex flex-wrap gap-2 items-center text-gray-300">
                                    <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Artist</span>
                                    {track.artists.map((artist, index) => (
                                        <span key={artist.id} className="flex items-center">
                                            {index > 0 && <span className="mr-1">,</span>}
                                            <button
                                                onClick={(e) => handleArtistClick(e, artist.id)}
                                                className="hover:text-white hover:underline font-medium transition-colors"
                                            >
                                                {artist.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {/* Album */}
                                <div className="flex items-center gap-2 text-gray-300">
                                    <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Album</span>
                                    <button
                                        onClick={(e) => handleAlbumClick(e, track.album.id, track.artists[0].id)}
                                        className="hover:text-white hover:underline font-medium transition-colors text-left"
                                    >
                                        {track.album.name}
                                    </button>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {SpotifyService.formatDuration(track.duration_ms)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 mt-auto">
                                <button
                                    onClick={handleSpotifyClick}
                                    className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                    </svg>
                                    Play on Spotify
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToFavourites(track.id);
                                    }}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 hover:border-white/20"
                                    title="Add to Favourites"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToPlaylist(track.id);
                                    }}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 hover:border-white/20"
                                    title="Add to Playlist"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
