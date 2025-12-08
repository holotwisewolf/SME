import React, { useEffect, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { getFavouriteAlbums } from '../../features/favourites/services/favourites_services';
import AlbumGrid from '../../features/favourites/favourites_albums/components/AlbumGrid';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AscendingButton from '../../components/ui/AscendingButton';
import DescendingButton from '../../components/ui/DescendingButton';
import FilterButton from '../../components/ui/FilterButton';

const LibraryAlbums: React.FC = () => {
    const [albums, setAlbums] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isFilterActive, setIsFilterActive] = useState(false);

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

    // Sort albums (note: albums are just IDs, so we sort the IDs alphabetically)
    const sortedAlbums = [...albums].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.localeCompare(b);
        } else {
            return b.localeCompare(a);
        }
    });

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
                    <h1 className="text-4xl font-bold text-[#FFD1D1] tracking-tight leading-none">
                        Favourited Albums
                    </h1>
                </div>

                {/* Sorting & Filtering Controls (Right Aligned) */}
                <div className="flex items-center gap-3">

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterActive(!isFilterActive)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isFilterActive ? 'bg-[#FFD1D1] text-black' : 'bg-[#292929] text-gray-400 hover:text-white'}`}
                    >
                        <FilterButton className="w-5 h-5" color="currentColor" isActive={isFilterActive} />
                    </button>

                    {/* Sort Toggle - Wrapped in LayoutGroup to isolate animations */}
                    <LayoutGroup id="album-sort">
                        <div className="bg-[#292929] rounded-full p-1 flex items-center h-10 relative isolate">
                            <button
                                onClick={() => setSortOrder('asc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortOrder === 'asc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {sortOrder === 'asc' && (
                                    <motion.div
                                        layoutId="albumSortIndicator"
                                        className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <AscendingButton className="w-4 h-4" color="currentColor" />
                            </button>

                            <button
                                onClick={() => setSortOrder('desc')}
                                className={`relative px-4 h-full rounded-full flex items-center justify-center z-10 transition-colors duration-200 ${sortOrder === 'desc' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {sortOrder === 'desc' && (
                                    <motion.div
                                        layoutId="albumSortIndicator"
                                        className="absolute inset-0 bg-[#1a1a1a] rounded-full -z-10 shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <DescendingButton className="w-4 h-4" color="currentColor" />
                            </button>
                        </div>
                    </LayoutGroup>
                </div>
            </div>
            <AlbumGrid albums={sortedAlbums} onDelete={loadAlbums} />
        </div>
    );
};

export default LibraryAlbums;

