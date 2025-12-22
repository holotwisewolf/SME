// useForYou hook - manages state and logic for For You page

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { getRecommendationSections, getAlbumRecommendations } from '../services/recommendation_services';
import type { RecommendedItem } from '../types/recommendation_types';

interface UseForYouReturn {
    // Track Data
    recommendations: RecommendedItem[];
    forYouSection: RecommendedItem[];
    artistBasedSection: RecommendedItem[];
    genreBasedSection: RecommendedItem[];

    // Album Data
    albumRecommendations: RecommendedItem[];

    // State
    isLoading: boolean;
    isLoadingAlbums: boolean;
    error: string | null;
    isEmpty: boolean;

    // Actions
    refresh: () => Promise<void>;
    loadAlbums: () => Promise<void>;

    // Selected item for modal
    selectedTrackId: string | null;
    setSelectedTrackId: (id: string | null) => void;
}

export const useForYou = (): UseForYouReturn => {
    const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
    const [forYouSection, setForYouSection] = useState<RecommendedItem[]>([]);
    const [artistBasedSection, setArtistBasedSection] = useState<RecommendedItem[]>([]);
    const [genreBasedSection, setGenreBasedSection] = useState<RecommendedItem[]>([]);

    // Album state
    const [albumRecommendations, setAlbumRecommendations] = useState<RecommendedItem[]>([]);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
    const [albumsLoaded, setAlbumsLoaded] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);

    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

    const loadRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Please sign in to see personalized recommendations');
                setIsLoading(false);
                return;
            }

            const sections = await getRecommendationSections(user.id);

            setForYouSection(sections.forYou);
            setArtistBasedSection(sections.basedOnArtists);
            setGenreBasedSection(sections.genreDiscovery);
            setRecommendations([...sections.forYou, ...sections.basedOnArtists, ...sections.genreDiscovery]);

            // Check if empty (no preferences)
            if (sections.forYou.length === 0 && sections.basedOnArtists.length === 0) {
                setIsEmpty(true);
            } else {
                setIsEmpty(false);
            }
        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError('Failed to load recommendations. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load album recommendations (lazy loaded when user switches to albums mode)
    const loadAlbums = useCallback(async () => {
        if (albumsLoaded || isLoadingAlbums) return;

        setIsLoadingAlbums(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const albums = await getAlbumRecommendations(user.id, 30);
            setAlbumRecommendations(albums);
            setAlbumsLoaded(true);
        } catch (err) {
            console.error('Error loading album recommendations:', err);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, [albumsLoaded, isLoadingAlbums]);

    // Load on mount
    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    const refresh = useCallback(async () => {
        setAlbumsLoaded(false); // Reset albums so they reload on next request
        await loadRecommendations();
    }, [loadRecommendations]);

    return {
        recommendations,
        forYouSection,
        artistBasedSection,
        genreBasedSection,
        albumRecommendations,
        isLoading,
        isLoadingAlbums,
        error,
        isEmpty,
        refresh,
        loadAlbums,
        selectedTrackId,
        setSelectedTrackId
    };
};
