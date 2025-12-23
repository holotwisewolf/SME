import { useState, useEffect } from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Tables } from '../../../types/supabase';
import type { EnhancedPlaylist } from '../services/playlist_services';
import { addToFavourites, removeFromFavourites, checkIsFavourite } from '../../favourites/services/favourites_services';
import { getPlaylistPreviewTracks } from '../services/playlist_services';

export interface UsePlaylistCardProps {
    playlist: Tables<'playlists'>;
    initialIsLiked?: boolean;
    onToggleFavorite?: (id: string, isFav: boolean) => void;
    lastUpdated?: number;
}

export const usePlaylistCard = ({
    playlist,
    initialIsLiked,
    onToggleFavorite,
    lastUpdated
}: UsePlaylistCardProps) => {
    const [isFavourite, setIsFavourite] = useState(initialIsLiked || false);
    const [showAddTrackModal, setShowAddTrackModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInlineExpanded, setIsInlineExpanded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [title, setTitle] = useState(playlist.title);
    const [color, setColor] = useState(playlist.color);
    const [imgUrl, setImgUrl] = useState((playlist as any).playlistimg_url);
    const [previewTracks, setPreviewTracks] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { setNodeRef, isOver } = useDroppable({
        id: playlist.id,
        data: { playlist }
    });

    useDndMonitor({
        onDragEnd(event) {
            const { active, over } = event;
            if (!over) return;
            const activeId = active.id as string;
            const overId = over.id as string;
            // Only reorder if the drag happened within THIS playlist card
            if (activeId.startsWith(`${playlist.id}::`) && overId.startsWith(`${playlist.id}::`)) {
                if (activeId !== overId) {
                    setPreviewTracks((items) => {
                        const oldIndex = items.findIndex((t) => `${playlist.id}::${t.id}` === activeId);
                        const newIndex = items.findIndex((t) => `${playlist.id}::${t.id}` === overId);
                        return arrayMove(items, oldIndex, newIndex);
                    });
                }
            }
        },
    });

    useEffect(() => {
        if (initialIsLiked !== undefined) {
            setIsFavourite(initialIsLiked);
        } else {
            checkIsFavourite(playlist.id, 'playlist').then(setIsFavourite);
        }
    }, [playlist.id, initialIsLiked]);

    useEffect(() => {
        setTitle(playlist.title);
        setColor(playlist.color);
        setImgUrl((playlist as any).playlistimg_url);
        setImgError(false); // Reset error when URL changes
    }, [playlist.title, playlist.color, (playlist as any).playlistimg_url]);

    useEffect(() => {
        const delay = Math.random() * 2000;
        const timeoutId = setTimeout(async () => {
            try {
                const tracks = await getPlaylistPreviewTracks(playlist.id, 20);
                setPreviewTracks(tracks || []);
            } catch (error) {
                console.error('Error loading preview tracks:', error);
            }
        }, delay);
        return () => clearTimeout(timeoutId);
    }, [playlist.id, lastUpdated, refreshTrigger]);

    const handleFavourite = async () => {
        const willBeFavourite = !isFavourite;
        setIsFavourite(willBeFavourite);
        if (onToggleFavorite) onToggleFavorite(playlist.id, willBeFavourite);
        try {
            if (!willBeFavourite) await removeFromFavourites(playlist.id, "playlist");
            else await addToFavourites(playlist.id, "playlist");
        } catch (error) {
            console.error('Error toggling favourite:', error);
            setIsFavourite(!willBeFavourite);
            alert('Failed to update favorite status.');
            if (onToggleFavorite) onToggleFavorite(playlist.id, !willBeFavourite);
        }
    };

    const handleTrackAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return {
        // State
        isFavourite,
        showAddTrackModal, setShowAddTrackModal,
        isExpanded, setIsExpanded,
        isInlineExpanded, setIsInlineExpanded,
        imgError, setImgError,
        title, setTitle,
        color, setColor,
        imgUrl, setImgUrl,
        previewTracks,

        // DnD
        setNodeRef,
        isOver,

        // Handlers
        handleFavourite,
        handleTrackAdded
    };
};
