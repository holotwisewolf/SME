import React from 'react';
import PlaylistCard from './PlaylistCard';
import type { Tables } from '../../../types/supabase';

interface PlaylistGridProps {
    playlists: Tables<'playlists'>[];
    onDelete?: () => void;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onDelete }) => {
    return (
        <div className="border border-[white/60] rounded-xl p-6 min-h-[400px] relative bg-[#444444]">
            {playlists.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <p className="text-xl font-medium mb-2">Oops, quite empty in here</p>
                    <p className="text-sm text-gray-500">Create a playlist to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
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