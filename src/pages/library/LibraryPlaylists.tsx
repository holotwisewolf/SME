import React from 'react';
import PlaylistDashboard from "../../features/playlist/components/PlaylistDashboard";

const LibraryPlaylists: React.FC = () => {
    return (
        <PlaylistDashboard source="library" />
    );
};

export default LibraryPlaylists;
