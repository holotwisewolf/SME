import React from 'react';
import PlaylistDashboard from "../../features/playlists/components/PlaylistDashboard";

const FavouritesPlaylists: React.FC = () => {
    return (
        <PlaylistDashboard source="favourites" />
    );
};

export default FavouritesPlaylists;
