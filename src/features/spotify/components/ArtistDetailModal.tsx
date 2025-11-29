import { useNavigate } from 'react-router-dom';
import type { ArtistFullDetail } from '../type/artist_type';
import { ViewOnSpotifyButton } from './ViewOnSpotifyButton';


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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={onClose}>
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
                        <ViewOnSpotifyButton
                            spotifyUrl={artist.externalUrl}
                            className="w-full"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
