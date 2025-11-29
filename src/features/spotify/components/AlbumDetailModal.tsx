import React from 'react';
import type { SpotifyAlbum } from '../type/spotify_types';

interface AlbumDetailModalProps {
    album: SpotifyAlbum;
    onClose: () => void;
}

export function AlbumDetailModal({ album, onClose }: AlbumDetailModalProps) {
    
    // 防止点击内容区域关闭弹窗
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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

                {/* Footer: Just the Spotify Button */}
                <div className="border-t border-gray-700 pt-4">
                    <a 
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 flex items-center justify-center gap-2">
                            {/* Spotify Icon */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.4-1.02 15.96 1.74.539.3.66 1.02.359 1.56-.24.48-1.02.6-1.44.3z"/>
                            </svg>
                            View on Spotify
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}