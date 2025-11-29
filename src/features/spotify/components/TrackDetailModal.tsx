import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SpotifyService } from '../services/spotify_services';
import type { SpotifyTrack } from '../type/spotify_types';
import { ViewOnSpotifyButton } from './ViewOnSpotifyButton';


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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/20"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-[400px] max-w-full bg-[#1f1f1f] rounded-lg shadow-2xl overflow-hidden border border-[#333] p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header: Title + Close Button */}
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-white">Track Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content: Image + Info */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group mb-4 shadow-lg">
                            <img
                                src={track.album.images[0]?.url}
                                alt={track.name}
                                className="w-48 h-48 rounded-lg object-cover"
                            />

                        </div>

                        <h3 className="text-xl font-bold text-white text-center mb-1 leading-tight">
                            {track.name}
                        </h3>

                        <div className="flex flex-wrap justify-center gap-1 text-gray-400 text-sm mb-2">
                            {track.artists.map((artist, index) => (
                                <span key={artist.id} className="flex items-center">
                                    {index > 0 && <span className="mr-1">,</span>}
                                    <button
                                        onClick={(e) => handleArtistClick(e, artist.id)}
                                        className="hover:text-white hover:underline transition-colors"
                                    >
                                        {artist.name}
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <button
                                onClick={(e) => handleAlbumClick(e, track.album.id, track.artists[0].id)}
                                className="hover:text-gray-300 hover:underline transition-colors"
                            >
                                {track.album.name}
                            </button>
                            <span>•</span>
                            <span>{SpotifyService.formatDuration(track.duration_ms)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToFavourites(track.id);
                                }}
                                className="flex-1 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Favourite
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToPlaylist(track.id);
                                }}
                                className="flex-1 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add to Playlist
                            </button>
                        </div>

                        <ViewOnSpotifyButton
                            spotifyUrl={track.external_urls.spotify}
                            label="Play on Spotify"
                            className="w-full"
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
