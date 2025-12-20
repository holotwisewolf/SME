import React from 'react';
import AlbumGrid from './components/AlbumGrid';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useYourAlbums } from './hooks/useYourAlbums';

const YourAlbums: React.FC = () => {
    const { albums, loading, loadAlbums } = useYourAlbums();

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
