import React, { useState, useEffect } from 'react';
import { SpotifyService } from '../../spotify/services/spotify_services';
import { addTrackToPlaylist } from '../services/playlist_services';
import SpotifyResultItem from '../../spotify/components/SpotifyResultItem';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SearchButton from '../../../components/ui/SearchButton';
import ClearButton from '../../../components/ui/ClearButton';

interface AddTrackModalProps {
    playlistId: string;
    playlistName: string;
    onClose: () => void;
    onTrackAdded: () => void;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({ 
    playlistId, 
    playlistName, 
    onClose,
    onTrackAdded 
}) => {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

    // Debounce Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchText.trim()) {
                setLoading(true);
                try {
                    const data = await SpotifyService.searchTracks(searchText, 10);
                    setResults(data.items || []);
                } catch (error) {
                    console.error("Spotify search failed", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const handleAddTrack = async (track: SpotifyTrack) => {
        setAddingTrackId(track.id);
        try {
            await addTrackToPlaylist({ playlistId, trackId: track.id });
            
            // Trigger the refresh in parent
            onTrackAdded();

        } catch (error) {
            console.error('Error adding track to playlist:', error);
            alert('Failed to add track');
        } finally {
            setAddingTrackId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f1f1f] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Add to "{playlistName}"</h2>
                        <p className="text-sm text-gray-400">Search for tracks to add</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchButton />
                        </div>
                        <input
                            type="text"
                            placeholder="Search songs..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all"
                            autoFocus
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <ClearButton />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <LoadingSpinner className="w-8 h-8 text-[#1db954]" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            {results.map((track) => (
                                <div key={track.id} className="relative group">
                                    <SpotifyResultItem
                                        track={track}
                                        isSelected={false}
                                        onSelect={() => handleAddTrack(track)}
                                    />
                                    {/* Add Button Overlay */}
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${addingTrackId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        {addingTrackId === track.id ? (
                                            <LoadingSpinner className="w-5 h-5 text-[#1db954]" />
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddTrack(track);
                                                }}
                                                className="bg-[#1db954] text-black px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchText ? (
                        <div className="text-center text-gray-500 mt-10">
                            No results found for "{searchText}"
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            Start typing to search
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};