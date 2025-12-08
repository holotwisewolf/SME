import React from 'react';
import { X } from 'lucide-react';

interface AlbumTrackDetailModalProps {
    track: any;
    onClose: () => void;
}

export const AlbumTrackDetailModal: React.FC<AlbumTrackDetailModalProps> = ({ track, onClose }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden w-full max-w-md border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-white font-bold text-lg">Track Details</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-white font-bold text-xl mb-1">{track.name}</h4>
                        <p className="text-gray-400 text-sm">
                            {track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'}
                        </p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Track Number:</span>
                            <span className="text-white">{track.track_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Duration:</span>
                            <span className="text-white">
                                {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}` : 'N/A'}
                            </span>
                        </div>
                        {track.explicit !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Explicit:</span>
                                <span className="text-white">{track.explicit ? 'Yes' : 'No'}</span>
                            </div>
                        )}
                        {track.preview_url && (
                            <div className="pt-2">
                                <span className="text-gray-500 block mb-2">Preview:</span>
                                <audio controls className="w-full">
                                    <source src={track.preview_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </div>

                    {track.external_urls?.spotify && (
                        <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                        >
                            Open in Spotify
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
