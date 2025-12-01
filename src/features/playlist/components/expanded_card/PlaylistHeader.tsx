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
    imgError: imgError,
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
        <div className="w-full md:w-[35%] p-4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto relative">

            {/* Title & Creator */}
            <div className="mt-2">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        onBlur={handleTitleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                        autoFocus
                        className="text-xl font-bold text-white bg-transparent border-b border-white/20 rounded-none px-0 py-1 focus:outline-none w-full mb-1 placeholder-gray-500"
                    />
                ) : (
                    <h2
                        onClick={() => isEditingEnabled && setIsEditingTitle(true)}
                        className={`text-xl font-bold text-white leading-tight mb-1 transition-all ${isEditingEnabled ? 'cursor-pointer hover:text-white/80' : ''}`}
                        title={isEditingEnabled ? "Click to edit" : ""}
                    >
                        {playlistTitle}
                    </h2>
                )}
                <p className="text-xs text-gray-400">Created by <span className="text-white">{creatorName}</span></p>
            </div>

            {/* Image */}
            <div className="relative group aspect-square w-full max-w-[280px] mx-auto shadow-2xl rounded-lg overflow-hidden bg-[#282828]">
                {!imgError ? (
                    <img
                        src={playlistImgUrl}
                        alt={playlistTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#282828]">
                        <span className="text-4xl">🎵</span>
                    </div>
                )}

                {/* Edit Overlay */}
                {isEditingEnabled && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer backdrop-blur-sm">
                        <EditIcon className="w-8 h-8 text-white mb-1" />
                        <span className="text-white text-xs font-medium tracking-wider uppercase">Change Cover</span>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-1.5">
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
                                        className={`w-4 h-4 ${star <= Math.round(ratingData.average) ? 'text-[#1DB954] fill-[#1DB954]' : 'text-gray-600'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                            <span className="text-white font-bold ml-2 text-sm">{ratingData.average.toFixed(1)}/5</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">rated by community</span>
                    </>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="text-white font-medium text-sm">No ratings yet</span>
                        {isEditingEnabled && (
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                    >
                                        <svg
                                            className="w-4 h-4 text-gray-600 hover:text-[#1DB954]"
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

            {/* Tags Container (Column-wrap layout with Horizontal Scroll) */}
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Tags</h3>
                    {isEditingEnabled && (
                        <button className="text-[10px] text-[#1DB954] hover:text-[#1ed760] font-medium">+ Add Tags</button>
                    )}
                </div>
                <div className="flex flex-col flex-wrap gap-1.5 overflow-x-auto h-[100px] content-start custom-scrollbar pb-2">
                    {tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] rounded-full border border-white/5 transition-colors whitespace-nowrap"
                            >
                                #{tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-[10px] italic">No tags yet</span>
                    )}
                </div>
            </div>
        </div>
    );
};
