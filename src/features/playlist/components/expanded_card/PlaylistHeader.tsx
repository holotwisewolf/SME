import React from 'react';
import EditIcon from '../../../../components/ui/EditIcon';
import ImageOptionsModal from '../../../../components/ui/ImageOptionsModal';
import { MarqueeText } from '../../../../components/ui/MarqueeText';
import { usePlaylistHeader } from '../../hooks/usePlaylistHeader';

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
    onImageUpdate?: () => void;
    trackCount: number;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
    playlistId,
    creatorName,
    playlistImgUrl,
    imgError,
    setImgError,
    userRating,
    tags: initialTags,
    isEditingTitle,
    setIsEditingTitle,
    playlistTitle,
    setPlaylistTitle,
    handleTitleUpdate,
    isEditingEnabled,
    onRatingUpdate,
    onImageUpdate,
    trackCount
}) => {
    // All logic extracted to hook
    const {
        tags,
        newTag,
        isUploading,
        isImageModalOpen,
        fileInputRef,
        setNewTag,
        setIsImageModalOpen,
        handleRate,
        handleImageClick,
        handleUploadClick,
        handleResetImage,
        handleFileChange,
        handleAddTag,
        handleRemoveTag
    } = usePlaylistHeader({
        playlistId,
        initialTags,
        userRating,
        onRatingUpdate,
        onImageUpdate,
        isEditingEnabled,
        setImgError
    });

    return (
        <>
            <div className="w-full md:w-[35%] p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5 bg-[#181818] overflow-y-auto">

                {/* Title & Creator */}
                <div>
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="text"
                                value={playlistTitle}
                                onChange={(e) => setPlaylistTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                                onBlur={handleTitleUpdate}
                                onMouseDown={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                autoFocus
                                className="text-2xl font-bold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-[#696969] w-full"
                            />
                            <button onClick={handleTitleUpdate} className="p-1 hover:bg-white/10 rounded-full text-[#FFD1D1] transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <MarqueeText
                            text={playlistTitle}
                            className={`text-2xl font-bold text-white leading-tight mb-1 transition-all ${isEditingEnabled ? 'cursor-pointer hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}
                            onClick={isEditingEnabled ? () => setIsEditingTitle(true) : undefined}
                        />
                    )}
                    <p className="text-sm text-gray-400">Created by <span className="text-white">{creatorName}</span></p>
                    <p className="text-xs text-gray-500 mt-1">{trackCount} {trackCount === 1 ? 'track' : 'tracks'}</p>
                </div>

                {/* Image Section */}
                <div className={`w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#2a2a2a] shadow-lg relative group ${isEditingEnabled ? 'cursor-pointer' : ''}`}
                    onClick={handleImageClick}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    {!imgError ? (
                        <img src={`${playlistImgUrl}?t=${Date.now()}`} alt={playlistTitle}
                            className={`w-full h-full object-cover transition-transform duration-500 ${isEditingEnabled ? 'group-hover:scale-105' : ''}`}
                            onError={() => setImgError(true)} />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center text-gray-600">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                    )}
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

                {/* Rating Section */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={isEditingEnabled ? () => handleRate(star) : undefined}
                                disabled={!isEditingEnabled}
                                className={`focus:outline-none transition-transform ${isEditingEnabled ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
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
                        {userRating && userRating > 0 ? `Rated by ${creatorName}` : `Not yet rated by ${creatorName}`}
                    </span>
                </div>

                {/* Tags Container */}
                <div className="flex-1 min-h-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-medium">Creator Tags</h3>
                        {isEditingEnabled && (
                            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleAddTag} placeholder="+ Add"
                                className="px-2 py-0.5 bg-transparent border-b border-white/10 text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-white/30 w-16 transition-all focus:w-24" />
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 overflow-y-auto pr-1 max-h-[65px] scrollbar-thin scrollbar-thumb-white/10">
                        {tags.length > 0 ? (
                            tags.map((tag, index) => (
                                <span key={index}
                                    className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-full border border-white/5 transition-colors flex items-center gap-1 group">
                                    #{tag}
                                    {isEditingEnabled && (
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
                                            className="ml-0.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                    )}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 text-[10px] italic">No tags</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Options Modal */}
            <ImageOptionsModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUpload={handleUploadClick}
                onReset={handleResetImage}
                hasCustomImage={!imgError && !!playlistImgUrl}
            />
        </>
    );
};