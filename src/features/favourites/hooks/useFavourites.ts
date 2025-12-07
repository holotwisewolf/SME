import { useState, useEffect } from 'react';
import { checkIsFavourite, addToFavourites, removeFromFavourites } from '../services/favourites_services';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import type { ItemType } from '../../../types/global';

export const useFavourites = (itemId: string, itemType: ItemType = 'track') => {
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    useEffect(() => {
        let mounted = true;

        const checkStatus = async () => {
            if (!itemId) return;
            try {
                const status = await checkIsFavourite(itemId, itemType);
                if (mounted) {
                    setIsLiked(status);
                }
            } catch (error) {
                console.error('Error checking favourite status:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkStatus();

        return () => {
            mounted = false;
        };
    }, [itemId, itemType]);

    const toggleLike = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        const previousState = isLiked;
        // Optimistic update
        setIsLiked(!previousState);

        try {
            if (previousState) {
                await removeFromFavourites(itemId, itemType);
                showSuccess('Removed from Liked Songs');
            } else {
                await addToFavourites(itemId, itemType);
                showSuccess('Added to Liked Songs');
            }
        } catch (error) {
            // Revert on error
            setIsLiked(previousState);
            showError('Failed to update favourite status');
            console.error('Error toggling favourite:', error);
        }
    };

    return { isLiked, loading, toggleLike };
};
