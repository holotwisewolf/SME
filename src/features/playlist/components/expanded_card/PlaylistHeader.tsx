import React, { useRef, useState } from 'react';
import EditIcon from '../../../../components/ui/EditIcon';
import { useError } from '../../../../context/ErrorContext';
import { updatePlaylistRating, uploadPlaylistImage, addPlaylistTag, removePlaylistTag, deletePlaylistRating, getPlaylistRating } from '../../services/playlist_services';

interface PlaylistHeaderProps {
    playlistId: string;
    creatorName: string;
    playlistImgUrl: string;
    imgError: boolean;
    setImgError: (error: boolean) => void;
    ratingData: { average: number; count: number };
    userRating: number | null;
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
    userRating,
    tags: initialTags,
    isEditingTitle,
    setIsEditingTitle,
    playlistTitle,
    setPlaylistTitle,
    handleTitleUpdate,
    isEditingEnabled,
    onRatingUpdate
}) => {
    const { showError } = useError();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [newTag, setNewTag] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Sync local tags with prop tags when prop changes (e.g. on load)
    React.useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    const handleRate = async (rating: number) => {
        if (!isEditingEnabled) return;

        try {
            if (userRating === rating) {
                // Toggle off (delete rating)
                await deletePlaylistRating(playlistId);
            } else {
                // Update or create rating
                await updatePlaylistRating(playlistId, rating);
            }
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    const handleImageClick = () => {
        if (isEditingEnabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadPlaylistImage(playlistId, file);
            window.location.reload(); // Simple way to refresh for now
        } catch (error) {
            console.error('Error uploading image:', error);
            showError('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            const tagToAdd = newTag.trim();
            if (tags.includes(tagToAdd)) {
                setNewTag('');
                return;
            }

            try {
                // Optimistic update
                setTags([...tags, tagToAdd]);
                setNewTag('');
                await addPlaylistTag(playlistId, tagToAdd);
            } catch (error) {
                console.error('Error adding tag:', error);
                setTags(tags); // Revert
            }
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!isEditingEnabled) return;

        try {
            // Optimistic update
            setTags(tags.filter(t => t !== tagToRemove));
            await removePlaylistTag(playlistId, tagToRemove);
        } catch (error) {
            console.error('Error removing tag:', error);
            setTags(tags); // Revert
        }
    };

    const [tempRating, setTempRating] = useState<string>(userRating?.toString() || '');

    // Sync tempRating with userRating
    React.useEffect(() => {
        setTempRating(userRating?.toString() || '');
    }, [userRating]);

    const handleNumericRate = async (rating: number) => {
        if (!isEditingEnabled) return;
        try {
            await updatePlaylistRating(playlistId, rating);
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    const handleNumericSubmit = () => {
        const val = parseFloat(tempRating);
        if (!isNaN(val) && val >= 0 && val <= 5) {
            handleNumericRate(val);
        } else {
            setTempRating(userRating?.toString() || ''); // Revert if invalid
        }
    };

    return (
        <div className="w-full md:w-[35%] p-6 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto">
            {/* Title & Creator */}
            <div>
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 mb-1">
                        <input
                            type="text"
                            value={playlistTitle}
                            onChange={(e) => setPlaylistTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                            autoFocus
                            className="text-2xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-[#696969] w-full"
                        />
                        <button
                            onClick={handleTitleUpdate}
                            className="p-1 hover:bg-white/10 rounded-full text-[#1DB954] transition-colors"
                            title="Confirm title"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <h2
                        onClick={() => isEditingEnabled && setIsEditingTitle(true)}
                        className={`text-2xl font-bold text-white leading-tight mb-1 transition-all ${isEditingEnabled ? 'cursor-pointer hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}
                        title={isEditingEnabled ? "Click to edit" : ""}
                    >
                        {playlistTitle}
                    </h2>
                )}
                <p className="text-sm text-gray-400">Created by <span className="text-white">{creatorName}</span></p>
            </div>

            {/* Image (4:3 Aspect Ratio) */}
            <div
                className={`w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative group ${isEditingEnabled ? 'cursor-pointer' : ''}`}
                onClick={handleImageClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {!imgError ? (
                    <img
                        src={`${playlistImgUrl}?t=${Date.now()}`} // Cache busting
                        alt={playlistTitle}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isEditingEnabled ? 'group-hover:scale-105' : ''}`}
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
                {isEditingEnabled && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-black/60 p-3 rounded-full hover:bg-black/80 transition-colors">
                            <EditIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}
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
                                        className={`w-5 h-5 ${star <= (userRating || Math.round(ratingData.average)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                            ))}
                            {isEditingEnabled ? (
                                <div className="flex items-center gap-2 ml-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={tempRating}
                                        onChange={(e) => setTempRating(e.target.value)}
                                        onBlur={handleNumericSubmit}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNumericSubmit()}
                                        className="w-12 px-0 py-0.5 bg-transparent border-b border-white/20 text-sm text-white focus:outline-none focus:border-[#1DB954] text-center font-medium appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        placeholder="-"
                                    />
                                    <span className="text-gray-500 text-sm font-light">/ 5</span>
                                </div>
                            ) : (
                                <span className="text-white font-bold ml-2">
                                    {Number.isInteger(ratingData.average) ? ratingData.average : ratingData.average.toFixed(1)}/5
                                </span>
                            )}
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
                                            className={`w-5 h-5 ${star <= (userRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
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
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tags</h3>
                    {isEditingEnabled && (
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="+ Add"
                            className="px-2 py-0.5 bg-transparent border-b border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30 w-20 transition-all focus:w-28"
                        />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors flex items-center gap-1 group"
                            >
                                #{tag}
                                {isEditingEnabled && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                                        className="ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                )}
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
