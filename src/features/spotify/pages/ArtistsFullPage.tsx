import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchArtists, getArtistDetails } from '../services/spotify_services';
import { ArtistDetailModal } from '../components/ArtistDetailModal';
import { useArtistPopup } from '../hooks/useArtistPopup';
import type { SpotifyArtist } from '../type/spotify_types';
import type { ArtistFullDetail } from '../type/artist_type';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { AnimatedLoadingDots } from '../../../components/ui/AnimatedLoadingDots';
import { useSidebarBlur } from '../../../hooks/useSidebarBlur';

export function ArtistsFullPage() {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const search = searchParams.get('search');

    const [artists, setArtists] = useState<SpotifyArtist[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);

    const { isOpen, selectedArtist, openPopup, closePopup } = useArtistPopup();

    useSidebarBlur(isOpen);

    useEffect(() => {
        loadArtists(true);
    }, [artistId, search]);

    const loadArtists = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setArtists([]);
        } else {
            setLoadingMore(true);
        }

        try {
            let results: SpotifyArtist[] = [];
            let totalCount = 0;
            const offset = reset ? 0 : artists.length;

            if (artistId) {
                // Fetch specific artist
                const artist = await getArtistDetails(artistId);
                results = [artist];
                totalCount = 1;
            } else {
                // Fetch search results or top artists
                let query = 'top artists';
                if (search) {
                    query = search;
                }

                const data = await searchArtists(query, 50, offset);
                results = data.items;
                totalCount = data.total;
            }

            if (reset) {
                setArtists(results);
            } else {
                setArtists(prev => [...prev, ...results]);
            }
            setTotal(totalCount);
        } catch (error) {
            console.error('Error loading artists:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        loadArtists(false);
    };

    const handleArtistClick = (artist: SpotifyArtist) => {
        const artistDetail: ArtistFullDetail = {
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images?.[0]?.url,
            genres: artist.genres,
            followers: artist.followers?.total,
            externalUrl: artist.external_urls?.spotify
        };
        openPopup(artistDetail);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#696969]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-[#696969] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {artists.length} Artists for '{artistId ? artists[0]?.name : (search || 'All Artists')}'
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {artists.map((artist) => (
                        <div
                            key={`${artist.id}-${artists.indexOf(artist)}`}
                            onClick={() => handleArtistClick(artist)}
                            className="bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#282828] transition-colors cursor-pointer group"
                        >
                            <img
                                src={artist.images[0]?.url || '/placeholder-artist.png'}
                                alt={artist.name}
                                className="w-full aspect-square object-cover rounded-full mb-4"
                            />
                            <h3 className="text-white font-semibold text-center truncate">
                                {artist.name}
                            </h3>
                            {artist.genres && artist.genres.length > 0 && (
                                <p className="text-gray-400 text-xs text-center mt-1 truncate">
                                    {artist.genres[0]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {artists.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No artists found
                    </div>
                )}

                {/* Load More Button */}
                {artists.length < total && artists.length > 0 && !artistId && (
                    <div className="flex justify-center mt-12 mb-8">
                        {loadingMore ? (
                            <div className="flex flex-col items-center gap-2">
                                <AnimatedLoadingDots color="#ffffff" size={40} />
                            </div>
                        ) : (
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-sm"
                            >
                                Load More
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isOpen && selectedArtist && (
                <ArtistDetailModal
                    artist={selectedArtist}
                    onClose={closePopup}
                />
            )}
        </div>
    );
}
