import { useNavigate } from 'react-router-dom';
import type { ArtistFullDetail } from '../contracts/artist_contract';

interface ArtistPopupCardProps {
    artist: ArtistFullDetail;
    onClose: () => void;
}

/**
 * Popup modal for artist details
 */
export function ArtistPopupCard({ artist, onClose }: ArtistPopupCardProps) {
    const navigate = useNavigate();

    const handleViewAllTracks = () => {
        navigate(`/tracksfullpage?artistId=${artist.id}`);
        onClose();
    };

    const handleViewAllAlbums = () => {
        navigate(`/albumsfullpage?artistId=${artist.id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1f1f1f] rounded-lg p-6 w-[500px] max-w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-white">Artist Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-4 mb-6">
                    {artist.imageUrl && (
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="w-32 h-32 rounded-full object-cover"
                        />
                    )}
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{artist.name}</h3>
                        {artist.followers !== undefined && (
                            <p className="text-sm text-gray-400 mb-1">
                                {artist.followers.toLocaleString()} followers
                            </p>
                        )}
                        {artist.genres && artist.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {artist.genres.map((genre, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-[#282828] text-xs text-gray-300 rounded-full"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleViewAllTracks}
                            className="flex-1 bg-[#f8baba] hover:bg-[#FFD1D1] text-black font-medium py-3 px-4 rounded-md transition-colors"
                        >
                            View All Tracks
                        </button>
                        <button
                            onClick={handleViewAllAlbums}
                            className="flex-1 bg-[#f8baba] hover:bg-[#FFD1D1] text-black font-medium py-3 px-4 rounded-md transition-colors"
                        >
                            View All Albums
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
