import React from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';

interface PlaylistGridProps {
    playlists: Tables<'playlists'>[];
    onDelete?: () => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete }) => {
    return (
        <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                    <p className="text-xl font-medium mb-2">Oops, quite empty in here</p>
                    <p className="text-sm text-gray-500">Create a playlist to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-8">
                    {playlists.map((playlist) => (
                        <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaylistGrid;