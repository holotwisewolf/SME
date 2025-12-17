import { useNavigate } from 'react-router-dom';
import type { ArtistFullDetail } from '../type/artist_type';

interface ArtistDetailModalProps {
    artist: ArtistFullDetail;
    onClose: () => void;
}

/**
 * Popup modal for artist details
 */
export function ArtistDetailModal({ artist, onClose }: ArtistDetailModalProps) {
    const navigate = useNavigate();

    const handleViewAllTracks = () => {
        navigate(`/tracksfullpage?artistId=${artist.id}&artistName=${encodeURIComponent(artist.name)}`);
        onClose();
    };

    const handleViewAllAlbums = () => {
        navigate(`/albumsfullpage?artistId=${artist.id}&artistName=${encodeURIComponent(artist.name)}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div
                className="bg-[#1f1f1f] rounded-lg p-6 w-[400px] max-w-full shadow-2xl border border-[#333]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Title + Close Button */}
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-white">Artist Details</h2>
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
                    {artist.imageUrl && (
                        <div className="relative group mb-4 shadow-lg">
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="w-48 h-48 rounded-full object-cover"
                            />

                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white text-center mb-1 leading-tight">
                        {artist.name}
                    </h3>

                    {artist.followers !== undefined && (
                        <p className="text-gray-400 text-sm text-center mb-3">
                            {artist.followers.toLocaleString()} followers
                        </p>
                    )}

                    {artist.genres && artist.genres.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {artist.genres.slice(0, 3).map((genre, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-[#282828] text-xs text-gray-300 rounded-full border border-white/5"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={handleViewAllTracks}
                            className="flex-1 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 text-sm font-medium"
                        >
                            View Tracks
                        </button>
                        <button
                            onClick={handleViewAllAlbums}
                            className="flex-1 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 text-sm font-medium"
                        >
                            View Albums
                        </button>
                    </div>
                    
                    
                    {artist.externalUrl && (
                        <a
                            href={artist.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 rounded-md flex items-center justify-center gap-2 bg-black/20 hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all text-sm font-medium group"
                        >
                            {/* Spotify Icon (Small) */}
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1DB954] group-hover:text-[#1ed760] transition-colors">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            View on Spotify
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}