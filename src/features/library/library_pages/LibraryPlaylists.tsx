import React from 'react';
import PlaylistDashboard from "../../playlist/components/PlaylistDashboard";

const LibraryPlaylists: React.FC = () => {
    return (
        <PlaylistDashboard source="library" />
    );
};

export default LibraryPlaylists;
