import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchArtists, getArtistDetails } from '../services/spotify_services';
import { ArtistPopupCard } from '../components/ArtistPopupCard';
import { useArtistPopup } from '../hooks/useArtistPopup';
import type { SpotifyArtist } from '../type/spotify_types';
import type { ArtistFullDetail } from '../contracts/artist_contract';

export function ArtistsFullPage() {
    const [searchParams] = useSearchParams();
    const artistId = searchParams.get('artistId');
    const search = searchParams.get('search');
    const [artists, setArtists] = useState<SpotifyArtist[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, selectedArtist, openPopup, closePopup } = useArtistPopup();

    useEffect(() => {
        loadArtists();
    }, [artistId, search]);

    const loadArtists = async () => {
        setLoading(true);
        try {
            if (artistId) {
                // Fetch specific artist
                const artist = await getArtistDetails(artistId);
                setArtists([artist]);
            } else if (search) {
                // Fetch search results
                const results = await searchArtists(search, 50);
                setArtists(results);
            } else {
                // Fetch top artists
                const results = await searchArtists('top artists', 50);
                setArtists(results);
            }
        } catch (error) {
            console.error('Error loading artists:', error);
        } finally {
            setLoading(false);
        }
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
            <div className="flex items-center justify-center min-h-screen bg-[#121212]">
                <div className="text-white text-xl">Loading artists...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {artistId ? 'Artist Details' : (search ? `Results for "${search}"` : 'All Artists')}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
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
            </div>

            {isOpen && selectedArtist && (
                <ArtistPopupCard
                    artist={selectedArtist}
                    onClose={closePopup}
                />
            )}
        </div>
    );
}
