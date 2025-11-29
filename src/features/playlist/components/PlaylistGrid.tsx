import React from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';

interface PlaylistGridProps {
    playlists: Tables<'playlists'>[];
    onDelete?: () => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {playlists.map((playlist) => (
                <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default PlaylistGrid;