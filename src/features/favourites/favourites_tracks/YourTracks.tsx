import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { getFavouriteTracks } from '../services/favourites_services';
import { getMultipleTracks } from '../../spotify/services/spotify_services';
import type { SpotifyTrack } from '../../spotify/type/spotify_types';
import { TrackCard } from './components/TrackCard';
import { SortableTrackCard } from './components/SortableTrackCard';
import { TrackReviewModal } from './components/TrackReviewModal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const YourTracks: React.FC = () => {
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        setLoading(true);
        try {
            const trackIds = await getFavouriteTracks();
            if (trackIds.length > 0) {
                // Fetch in batches of 50
                const batch = trackIds.slice(0, 50);
                const data = await getMultipleTracks(batch);
                setTracks(data.tracks);
            } else {
                setTracks([]);
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setTracks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artists.some((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

        // Mock rating filter logic (since we don't have real ratings yet)
        const matchesRating = ratingFilter ? true : true;

        return matchesSearch && matchesRating;
    });

    const activeTrack = activeId ? tracks.find(t => t.id === activeId) : null;

    return (
        <div className="min-h-screen bg-[#696969] text-white p-8 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <div className="mb-2">
                        <h1 className="text-4xl font-bold tracking-tight leading-none text-[#FFD1D1]">Liked Tracks</h1>
                    </div>
                    <p className="text-[#A7A7A7] text-lg">
                        {tracks.length} tracks - {tracks.length > 0 ? 'Added' : 'Add favourites to view tracks here'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A7A7]" />
                        <input
                            type="text"
                            placeholder="Search collection..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#181818] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#1DB954] transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setRatingFilter(ratingFilter ? null : 4)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${ratingFilter
                            ? 'bg-[#1DB954]/10 border-[#1DB954] text-[#1DB954]'
                            : 'bg-[#181818] border-white/5 text-[#A7A7A7] hover:border-white/20'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">4+ Stars</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner className="w-10 h-10 text-[white]" />
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="border border-[white/60] rounded-xl p-6 relative bg-[#444444]">
                        <SortableContext
                            items={filteredTracks.map(t => t.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {filteredTracks.map(track => (
                                    <SortableTrackCard
                                        key={track.id}
                                        track={track}
                                        onClick={() => setSelectedTrack(track)}
                                        isFavourite={true}
                                        onToggleFavourite={() => {
                                            // Remove from list if unfavourited
                                            setTracks(prev => prev.filter(t => t.id !== track.id));
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </div>

                    <DragOverlay>
                        {activeTrack ? (
                            <div className="w-full h-full">
                                <TrackCard
                                    track={activeTrack}
                                    onClick={() => { }}
                                    isFavourite={true}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedTrack && (
                    <TrackReviewModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default YourTracks;
