import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SpotifyTrack } from '../../../../spotify/type/spotify_types';

interface TrackHeaderProps {
    track: SpotifyTrack;
    imgError: boolean;
    setImgError: (error: boolean) => void;
    userRating: number;
    tags: string[];
    newTag: string;
    setNewTag: (tag: string) => void;
    handleRatingClick: (rating: number) => void;
    handleAddTag: (e: React.KeyboardEvent) => void;
    removeTag: (tag: string) => void;
    userName?: string;
    onClose?: () => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
    track,
    imgError,
    setImgError,
    userRating,
    tags,
    newTag,
    setNewTag,
    handleRatingClick,
    handleAddTag,
    removeTag,
    userName = 'You',
    onClose
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-full md:w-[35%] p-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto">

            {/* Metadata */}
            <div>
                <h2 className="text-2xl font-bold text-white leading-tight mb-1">
                    {track.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    {track.album.name}
                </p>
                <p className="text-sm text-gray-400">
                    By <span
                        className="text-white hover:underline cursor-pointer transition-colors hover:text-[#FFD1D1]"
                        onClick={() => {
                            const artistName = track.artists?.[0]?.name;
                            if (artistName) {
                                if (onClose) onClose();
                                navigate(`/artistsfullpage?search=${encodeURIComponent(artistName)}`);
                            }
                        }}
                    >
                        {track.artists.map((a: any) => a.name).join(', ')}
                    </span>
                </p>
            </div>

            {/* Image */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative group shrink-0">
                {!imgError ? (
                    <img
                        src={track.album.images[0]?.url}
                        alt={track.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                        <span className="text-xs">No Image</span>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRatingClick(star)}
                            className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                            <svg
                                className={`w-5 h-5 ${star <= (userRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                    ))}
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {userRating > 0 ? `Rated by ${userName}` : `Not yet rated by ${userName}`}
                </span>
            </div>

            {/* Tags Container */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors flex items-center gap-1 group"
                            >
                                #{tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-xs italic">No tags</span>
                    )}
                </div>
            </div>
        </div>
    );
};
