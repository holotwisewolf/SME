import React, { useState, useEffect } from 'react';
import { SpotifyService } from '../../spotify/services/spotify_services';
import { addTrackToPlaylist } from '../services/playlist_services';
import SpotifyResultItem from '../../spotify/components/SpotifyResultItem';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import SearchButton from '../../../components/ui/SearchButton';
import ClearButton from '../../../components/ui/ClearButton';
import { useError } from '../../../context/ErrorContext';
import { useSuccess } from '../../../context/SuccessContext';
import { X } from 'lucide-react';

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
    const { showError } = useError();
    const { showSuccess } = useSuccess();

    useEffect(() => {
        const searchTracks = async () => {
            if (!searchText.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const searchResults = await SpotifyService.searchTracks(searchText);
                setResults(searchResults.items || []);
            } catch (error) {
                console.error('Error searching tracks:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchTracks, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchText]);

    const handleAddTrack = async (track: SpotifyTrack) => {
        setAddingTrackId(track.id);
        try {
            await addTrackToPlaylist({ playlistId, trackId: track.id });
            onTrackAdded();
            showSuccess('Track added to playlist');
        } catch (error: any) {
            console.error('Error adding track to playlist:', error);
            const errorMessage = error?.message?.toLowerCase() || '';
            if (errorMessage.includes('already in playlist')) {
                showError('This track is already in the playlist');
            } else {
                showError('Failed to add track to playlist');
            }
        } finally {
            setAddingTrackId(null);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            // Stop click propagation to background
            onClick={onClose}
        >
            <div
                className="bg-[#1f1f1f] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-white/10"
                // Prevent clicks inside the modal from closing it
                onClick={(e) => e.stopPropagation()}
                // Isolate modal events from parent drag listeners
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Add to "{playlistName}"</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Search for tracks to add</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input Container */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div
                        className="relative"
                        // Stop mouse events on the container level as a safety net
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none scale-90">
                            <SearchButton />
                        </div>

                        <input
                            type="text"
                            placeholder="Search songs..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            // UI STYLE: Small white box (border-white), dark bg, compact padding
                            className="w-full bg-[#121212] border border-white text-white text-sm pl-10 pr-10 py-1.5 rounded-md focus:outline-none focus:bg-black transition-all cursor-text select-text placeholder-gray-500"
                            autoFocus

                            // --- CRITICAL FIXES FOR TEXT HIGHLIGHTING ---
                            // 1. Prevent native drag start behavior
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}

                            // 2. Stop MouseDown (Standard)
                            onMouseDown={(e) => e.stopPropagation()}

                            // 3. Stop PointerDown (Fixes 'dragging while highlighting' in modern browsers/libraries)
                            onPointerDown={(e) => e.stopPropagation()}

                            // 4. Stop KeyDown (Prevents typing from triggering parent shortcuts)
                            onKeyDown={(e) => e.stopPropagation()}
                        />

                        {searchText && (
                            <button
                                onClick={() => setSearchText('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all scale-90"
                            >
                                <ClearButton />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 min-h-[300px] custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            {/* White Loading Spinner */}
                            <LoadingSpinner className="w-8 h-8 text-white" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((track) => (
                                <div key={track.id} className="relative group">
                                    <SpotifyResultItem
                                        track={track}
                                        isSelected={false}
                                        onSelect={() => handleAddTrack(track)}
                                        className="p-2.5 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                                    />
                                    {/* No 'Add' button overlay, just click the item to add */}
                                </div>
                            ))}
                        </div>
                    ) : searchText ? (
                        <div className="flex justify-center items-center h-48 text-gray-500 text-sm">
                            No results found for "{searchText}"
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-48 text-gray-500 text-sm">
                            Start typing to search
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};