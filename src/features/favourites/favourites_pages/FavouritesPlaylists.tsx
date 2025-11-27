import React from 'react';
import PlaylistDashboard from "../../../features/library/components/PlaylistDashboard";

const FavouritesPlaylists: React.FC = () => {
    return (
        <PlaylistDashboard source="favourites" />
    );
};

export default FavouritesPlaylists;
