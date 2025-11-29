import React from 'react';
import type { SpotifyAlbum } from '../type/spotify_types';
import { ViewOnSpotifyButton } from './ViewOnSpotifyButton';


interface AlbumDetailModalProps {
    album: SpotifyAlbum;
    onClose: () => void;
    onAddToFavourites: (albumId: string) => void;
    onImportToPlaylist: (album: SpotifyAlbum) => void;
}

export function AlbumDetailModal({ album, onClose, onAddToFavourites, onImportToPlaylist }: AlbumDetailModalProps) {

    // avoid closing when clicking inside the modal
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#1f1f1f] rounded-lg p-6 w-[400px] max-w-full shadow-2xl border border-[#333]"
                onClick={handleContentClick}
            >
                {/* Header: Title + Close Button */}
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-white">Album Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content: Image + Info */}
                <div className="flex flex-col items-center mb-6">
                    {album.images && album.images[0] && (
                        <div className="relative group mb-4 shadow-lg">
                            <img
                                src={album.images[0].url}
                                alt={album.name}
                                className="w-48 h-48 rounded-lg object-cover"
                            />

                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white text-center mb-1 leading-tight">
                        {album.name}
                    </h3>

                    <p className="text-gray-400 text-sm text-center mb-2">
                        {album.artists.map(a => a.name).join(', ')}
                    </p>

                    <p className="text-gray-500 text-xs text-center">
                        {album.release_date} • {album.total_tracks} tracks
                    </p>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToFavourites(album.id);
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
                                onImportToPlaylist(album);
                            }}
                            className="flex-1 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Import
                        </button>
                    </div>

                    <ViewOnSpotifyButton
                        spotifyUrl={album.external_urls.spotify}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}