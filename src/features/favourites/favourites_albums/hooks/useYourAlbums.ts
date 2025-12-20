import { useState, useEffect } from 'react';
import { getFavouriteAlbums } from '../../services/favourites_services';

export const useYourAlbums = () => {
    const [albums, setAlbums] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAlbums = async () => {
        try {
            const albumsData = await getFavouriteAlbums();
            setAlbums(albumsData.map(a => a.item_id));
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    return {
        albums,
        loading,
        loadAlbums
    };
};
