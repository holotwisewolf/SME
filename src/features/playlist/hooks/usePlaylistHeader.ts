import { useState, useRef, useEffect } from 'react';
import { useError } from '../../../context/ErrorContext';
import {
    updatePlaylistRating,
    uploadPlaylistImage,
    resetPlaylistImage,
    addPlaylistTag,
    removePlaylistTag,
    deletePlaylistRating
} from '../services/playlist_services';

// ============================================
// Types
// ============================================

export interface UsePlaylistHeaderProps {
    playlistId: string;
    initialTags: string[];
    userRating: number | null;
    onRatingUpdate: () => void;
    onImageUpdate?: () => void;
    isEditingEnabled: boolean;
    setImgError: (error: boolean) => void;
}

export interface UsePlaylistHeaderReturn {
    // State
    tags: string[];
    newTag: string;
    isUploading: boolean;
    isImageModalOpen: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;

    // Setters
    setNewTag: (tag: string) => void;
    setIsImageModalOpen: (open: boolean) => void;

    // Handlers
    handleRate: (rating: number) => Promise<void>;
    handleImageClick: () => void;
    handleUploadClick: () => void;
    handleResetImage: () => Promise<void>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleAddTag: (e: React.KeyboardEvent) => Promise<void>;
    handleRemoveTag: (tagToRemove: string) => Promise<void>;
}

// ============================================
// Validation Helpers
// ============================================

const MAX_FILE_SIZE_MB = 5;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB` };
    }
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please use JPG, PNG, GIF, or WebP' };
    }
    return { valid: true };
}

function formatUploadError(error: any): string {
    if (error?.message?.includes('Payload too large') || error?.statusCode === 413) {
        return 'File too large. Please use a smaller image';
    }
    return 'Failed to upload image';
}

// ============================================
// Hook
// ============================================

export function usePlaylistHeader({
    playlistId,
    initialTags,
    userRating,
    onRatingUpdate,
    onImageUpdate,
    isEditingEnabled,
    setImgError
}: UsePlaylistHeaderProps): UsePlaylistHeaderReturn {
    const { showError } = useError();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state
    const [tags, setTags] = useState<string[]>(initialTags);
    const [newTag, setNewTag] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Sync tags with props
    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    // ----------------------------------------
    // Rating Handler
    // ----------------------------------------
    const handleRate = async (rating: number) => {
        try {
            // Toggle: if same rating, delete it
            if (userRating === rating) {
                await deletePlaylistRating(playlistId);
            } else {
                await updatePlaylistRating(playlistId, rating);
            }
            onRatingUpdate();
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    // ----------------------------------------
    // Image Handlers
    // ----------------------------------------
    const handleImageClick = () => {
        if (isEditingEnabled) {
            setIsImageModalOpen(true);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleResetImage = async () => {
        setIsUploading(true);
        try {
            await resetPlaylistImage(playlistId);
            setImgError(true);
            onImageUpdate?.();
        } catch (error) {
            console.error('Error resetting image:', error);
            showError('Failed to reset image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate
        const validation = validateImageFile(file);
        if (!validation.valid) {
            showError(validation.error!);
            return;
        }

        setIsUploading(true);
        try {
            await uploadPlaylistImage(playlistId, file);
            setImgError(false);
            onImageUpdate?.();
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showError(formatUploadError(error));
        } finally {
            setIsUploading(false);
        }
    };

    // ----------------------------------------
    // Tag Handlers
    // ----------------------------------------
    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || !newTag.trim()) return;

        const tagToAdd = newTag.trim();

        // Duplicate check
        if (tags.includes(tagToAdd)) {
            setNewTag('');
            return;
        }

        // Optimistic update
        setTags(prev => [...prev, tagToAdd]);
        setNewTag('');

        try {
            await addPlaylistTag(playlistId, tagToAdd);
        } catch (error) {
            console.error('Error adding tag:', error);
            setTags(tags); // Revert
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!isEditingEnabled) return;

        // Optimistic update
        const previousTags = tags;
        setTags(prev => prev.filter(t => t !== tagToRemove));

        try {
            await removePlaylistTag(playlistId, tagToRemove);
        } catch (error) {
            console.error('Error removing tag:', error);
            setTags(previousTags); // Revert
        }
    };

    return {
        // State
        tags,
        newTag,
        isUploading,
        isImageModalOpen,
        fileInputRef,

        // Setters
        setNewTag,
        setIsImageModalOpen,

        // Handlers
        handleRate,
        handleImageClick,
        handleUploadClick,
        handleResetImage,
        handleFileChange,
        handleAddTag,
        handleRemoveTag
    };
}
