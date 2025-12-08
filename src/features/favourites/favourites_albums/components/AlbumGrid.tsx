import React, { useState } from 'react';
import AlbumCard from './AlbumCard';

interface AlbumGridProps {
    albums: string[]; // Array of album IDs
    onDelete?: () => void;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onDelete }) => {
    const [removedAlbums, setRemovedAlbums] = useState<Set<string>>(new Set());

    const handleRemove = (albumId: string) => {
        setRemovedAlbums(prev => new Set([...prev, albumId]));
        onDelete?.();
    };

    const visibleAlbums = albums.filter(id => !removedAlbums.has(id));

    return (
        <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
            {visibleAlbums.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                    <p className="text-xl font-medium mb-2">No albums in your library yet</p>
                    <p className="text-sm text-gray-500">Add albums to your favorites to see them here</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-8 items-start">
                    {visibleAlbums.map((albumId) => (
                        <AlbumCard
                            key={albumId}
                            albumId={albumId}
                            onRemove={() => handleRemove(albumId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlbumGrid;
