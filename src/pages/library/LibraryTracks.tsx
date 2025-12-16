import React from 'react';
import YourTracks from '../../features/favourites/favourites_tracks/YourTracks';

const LibraryTracks: React.FC = () => {
    return (
        <div className="h-full w-full bg-[#696969]">
            <YourTracks />
        </div>
    );
};

export default LibraryTracks;
