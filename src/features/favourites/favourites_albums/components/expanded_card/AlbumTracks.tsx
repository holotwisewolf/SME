import React from 'react';

interface AlbumTracksProps {
    tracks: any[];
    albumImage?: string;
    onTrackClick: (track: any) => void;
}

export const AlbumTracks: React.FC<AlbumTracksProps> = ({
    tracks,
    albumImage,
    onTrackClick
}) => {
    return (
        <div className="flex flex-col h-full">
            {/* Header Row */}
            <div className="flex items-center justify-between text-gray-400 text-sm border-b border-white/5 pb-2 mb-2 flex-shrink-0">
                <span className="pl-2"># Title</span>
                <span className="pr-2">Duration</span>
            </div>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {tracks.length > 0 ? (
                    tracks.map((track, index) => (
                        <div
                            key={track.id || index}
                            onClick={() => onTrackClick(track)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            {/* Track Number */}
                            <div className="w-6 text-center">
                                <span className="text-gray-500 text-sm">{track.track_number || index + 1}</span>
                            </div>

                            {/* Album Art */}
                            <div className="w-10 h-10 rounded overflow-hidden bg-[#282828] shrink-0">
                                {albumImage ? (
                                    <img src={albumImage} alt={track.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-200 font-medium truncate group-hover:text-white transition-colors">
                                    {track.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="text-xs text-gray-500">
                                {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}` : '-:--'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No tracks found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
