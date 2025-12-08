import React, { useEffect, useState } from 'react';
import { getFavouriteAlbums } from '../services/favourites_services';
import AlbumGrid from './components/AlbumGrid';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const YourAlbums: React.FC = () => {
    const [albums, setAlbums] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlbums();
    }, []);

    const loadAlbums = async () => {
        try {
            const albumIds = await getFavouriteAlbums();
            setAlbums(albumIds);
        } catch (error) {
            console.error('Error loading albums:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full px-6 relative pb-32">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 pt-2 mt-6">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">Favourited Albums</h1>
                </div>
            </div>
            <AlbumGrid albums={albums} onDelete={loadAlbums} />
        </div>
    );
};

export default YourAlbums;
