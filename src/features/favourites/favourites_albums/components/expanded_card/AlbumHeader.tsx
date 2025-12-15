import React, { useState } from 'react';
import { updateItemRating, deleteItemRating } from '../../../services/item_services';
import { addItemTag, removeItemTag } from '../../../services/item_services';

interface AlbumHeaderProps {
    albumId: string;
    album: any;
    ratingData: { average: number; count: number };
    userRating: number | null;
    tags: string[];
    onRatingUpdate: () => void;
    userName?: string;
}

export const AlbumHeader: React.FC<AlbumHeaderProps> = ({
    albumId,
    album,
    ratingData,
    userRating,
    tags: initialTags,
    onRatingUpdate,
    userName = 'You'
}) => {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [newTag, setNewTag] = useState('');

    // Sync local tags with prop tags when prop changes
    React.useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    const handleRate = async (rating: number) => {
        try {
            if (userRating === rating) {
                // Toggle off (delete rating)
                await deleteItemRating(albumId, 'album');
            } else {
                // Update or create rating
                await updateItemRating(albumId, 'album', rating);
            }
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
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
                await addItemTag(albumId, 'album', tagToAdd);
            } catch (error) {
                console.error('Error adding tag:', error);
                setTags(tags); // Revert
            }
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        try {
            // Optimistic update
            setTags(tags.filter(t => t !== tagToRemove));
            await removeItemTag(albumId, 'album', tagToRemove);
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
        try {
            await updateItemRating(albumId, 'album', rating);
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
            {/* Title & Artist */}
            <div>
                <h2 className="text-2xl font-bold text-white leading-tight mb-1">
                    {album.name}
                </h2>
                <p className="text-sm text-gray-400">
                    by <span className="text-white">{album.artists?.[0]?.name || 'Unknown Artist'}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {album.release_date ? new Date(album.release_date).getFullYear() : ''} • {album.total_tracks} tracks
                </p>
            </div>

            {/* Album Image (4:3 Aspect Ratio) */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative">
                {album.images?.[0]?.url ? (
                    <img
                        src={album.images[0].url}
                        alt={album.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRate(star)}
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
                    {userRating && userRating > 0 ? `Rated by ${userName}` : `Not yet rated by ${userName}`}
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
