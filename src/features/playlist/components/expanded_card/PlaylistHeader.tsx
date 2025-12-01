import React from 'react';
import EditIcon from '../../../../components/ui/EditIcon';

import { updatePlaylistRating } from '../../services/playlist_services';

interface PlaylistHeaderProps {
    playlistId: string;
    creatorName: string;
    playlistImgUrl: string;
    imgError: boolean;
    setImgError: (error: boolean) => void;
    ratingData: { average: number; count: number };
    tags: string[];
    isEditingTitle: boolean;
    setIsEditingTitle: (isEditing: boolean) => void;
    playlistTitle: string;
    setPlaylistTitle: (title: string) => void;
    handleTitleUpdate: () => void;
    isEditingEnabled: boolean;
    onRatingUpdate: () => void;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
    playlistId,
    creatorName,
    playlistImgUrl,
    imgError,
    setImgError,
    ratingData,
    tags,
    isEditingTitle,
    setIsEditingTitle,
    playlistTitle,
    setPlaylistTitle,
    handleTitleUpdate,
    isEditingEnabled,
    onRatingUpdate
}) => {
    const handleRate = async (rating: number) => {
        if (!isEditingEnabled) return; // Only allow rating if editing is enabled

        try {
            await updatePlaylistRating(playlistId, rating);
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    return (
        <div className="w-full md:w-[35%] p-6 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto">
            {/* Title & Creator */}
            <div>
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        onBlur={handleTitleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                        autoFocus
                        className="text-2xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-[#1DB954] w-full mb-1"
                    />
                ) : (
                    <h2
                        onClick={() => isEditingEnabled && setIsEditingTitle(true)}
                        className={`text-2xl font-bold text-white leading-tight mb-1 transition-all ${isEditingEnabled ? 'cursor-pointer hover:text-[#1DB954] hover:drop-shadow-[0_0_8px_rgba(29,185,84,0.5)]' : ''}`}
                        title={isEditingEnabled ? "Click to edit" : ""}
                    >
                        {playlistTitle}
                    </h2>
                )}
                <p className="text-sm text-gray-400">Created by <span className="text-white">{creatorName}</span></p>
            </div>

            {/* Image (4:3 Aspect Ratio) */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative group">
                {!imgError ? (
                    <img
                        src={playlistImgUrl}
                        alt={playlistTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="bg-black/60 p-3 rounded-full hover:bg-black/80 transition-colors">
                        <EditIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
                {ratingData.count > 0 ? (
                    <>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(star)}
                                    disabled={!isEditingEnabled}
                                    className={`focus:outline-none transition-transform ${isEditingEnabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                >
                                    <svg
                                        className={`w-5 h-5 ${star <= Math.round(ratingData.average) ? 'text-[#1DB954] fill-[#1DB954]' : 'text-gray-600'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                            <span className="text-white font-bold ml-2">{ratingData.average.toFixed(1)}/5</span>
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rated by {ratingData.count} users</span>
                    </>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-sm italic">No ratings yet</span>
                        {isEditingEnabled && (
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-600 hover:text-[#1DB954]"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tags Container (Flexible Wrap) */}
            <div className="flex-1">
                <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors"
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
