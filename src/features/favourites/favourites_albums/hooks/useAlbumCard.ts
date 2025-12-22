import { useState, useEffect } from 'react';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../services/favourites_services';
import { getAlbum, getAlbumTracks } from '../../../spotify/services/spotify_services';

export interface UseAlbumCardProps {
    albumId: string;
    onRemove?: () => void;
    initialData?: any;
}

export const useAlbumCard = ({ albumId, onRemove, initialData }: UseAlbumCardProps) => {
    const [isFavourite, setIsFavourite] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInlineExpanded, setIsInlineExpanded] = useState(false);
    const [album, setAlbum] = useState<any>(initialData || null);
    const [previewTracks, setPreviewTracks] = useState<any[]>(initialData?.tracks?.items || []);
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        checkIsFavourite(albumId, 'album').then(setIsFavourite);
    }, [albumId]);

    useEffect(() => {
        if (initialData) {
            setLoading(false);
            return;
        }

        const loadAlbumData = async () => {
            try {
                const [albumData, tracksData] = await Promise.all([
                    getAlbum(albumId),
                    getAlbumTracks(albumId)
                ]);
                setAlbum(albumData);
                setPreviewTracks(tracksData.items || tracksData || []);
            } catch (error) {
                console.error('Error loading album:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAlbumData();
    }, [albumId, initialData]);

    const handleFavourite = async () => {
        const willBeFavourite = !isFavourite;
        setIsFavourite(willBeFavourite);

        try {
            if (!willBeFavourite) {
                await removeFromFavourites(albumId, "album");
                onRemove?.();
            } else {
                await addToFavourites(albumId, "album");
            }
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite);
            alert('Failed to update favorite status.');
        }
    };

    return {
        isFavourite, setIsFavourite,
        isExpanded, setIsExpanded,
        isInlineExpanded, setIsInlineExpanded,
        album,
        previewTracks,
        loading,
        handleFavourite
    };
};
