import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrackPreview } from '../hooks/useTrackPreview';
import { useArtistPopup } from '../hooks/useArtistPopup';
import { addToFavourites } from '../../favourites/services/favourites_services';
import { getAlbumDetails } from '../services/spotify_services';
import { useSuccess } from '../../../context/SuccessContext';
import { useError } from '../../../context/ErrorContext';
import type { ArtistFullDetail } from '../type/artist_type';
import type { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../type/spotify_types';

export const useSpotifyResultList = (
    type: 'Tracks' | 'Albums' | 'Artists',
    searchText: string = '',
    onClose?: () => void
) => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { playPreview, stopPreview } = useTrackPreview();
    const { isOpen: isArtistPopupOpen, selectedArtist, openPopup: openArtistPopup, closePopup: closeArtistPopup } = useArtistPopup();
    const { showSuccess } = useSuccess();
    const { showError } = useError();

    // State
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ id?: string; name: string; trackIds?: string[] } | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Handlers
    const handleAddToFavourites = async (trackId: string) => {
        try {
            await addToFavourites(trackId, 'track');
            showSuccess('Track added to favorites!');
        } catch (error) {
            console.error('Error adding to favourites:', error);
            showError('Failed to add track to favorites');
        }
    };

    const handleAddAlbumToFavourites = async (albumId: string) => {
        try {
            await addToFavourites(albumId, 'album');
            showSuccess('Album added to favorites!');
        } catch (error) {
            console.error('Error adding album to favourites:', error);
            showError('Failed to add album to favorites');
        }
    };

    const handleAddToPlaylist = (trackId: string, trackName: string) => {
        setPlaylistModalTrack({ id: trackId, name: trackName });
    };

    const handleImportAlbumToPlaylist = async (albumId: string, albumName: string) => {
        try {
            const albumDetails = await getAlbumDetails(albumId);
            const tracks = albumDetails?.tracks?.items || [];
            const trackIds = tracks.map((t: any) => t.id);

            if (trackIds.length > 0) {
                setPlaylistModalTrack({
                    name: albumName,
                    trackIds: trackIds
                });
            }
        } catch (error) {
            console.error('Error fetching album tracks:', error);
        }
    };

    const handleTrackClick = (track: SpotifyTrack) => {
        setSelectedTrack(track);
    };

    const handleAlbumClick = (album: SpotifyAlbum) => {
        setSelectedAlbum(album);
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
        openArtistPopup(artistDetail);
    };

    const handleViewFullPage = () => {
        const searchParam = searchText ? `?search=${encodeURIComponent(searchText)}` : '';
        if (type === 'Tracks') {
            navigate(`/tracksfullpage${searchParam}`);
        } else if (type === 'Albums') {
            navigate(`/albumsfullpage${searchParam}`);
        } else if (type === 'Artists') {
            navigate(`/artistsfullpage${searchParam}`);
        }
        onClose?.();
    };

    return {
        containerRef,
        playPreview,
        stopPreview,
        isArtistPopupOpen,
        selectedArtist,
        closeArtistPopup,
        playlistModalTrack,
        setPlaylistModalTrack,
        selectedTrack,
        setSelectedTrack,
        selectedAlbum,
        setSelectedAlbum,
        activeMenuId,
        setActiveMenuId,
        handleAddToFavourites,
        handleAddAlbumToFavourites,
        handleAddToPlaylist,
        handleImportAlbumToPlaylist,
        handleTrackClick,
        handleAlbumClick,
        handleArtistClick,
        handleViewFullPage
    };
};
