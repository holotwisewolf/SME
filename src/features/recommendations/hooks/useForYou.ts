// useForYou hook - manages state and logic for For You page

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { getRecommendations, getRecommendationSections } from '../services/recommendation_services';
import type { RecommendedItem } from '../types/recommendation_types';

interface UseForYouReturn {
    // Data
    recommendations: RecommendedItem[];
    forYouSection: RecommendedItem[];
    artistBasedSection: RecommendedItem[];
    genreBasedSection: RecommendedItem[];

    // State
    isLoading: boolean;
    error: string | null;
    isEmpty: boolean;

    // Actions
    refresh: () => Promise<void>;

    // Selected item for modal
    selectedTrackId: string | null;
    setSelectedTrackId: (id: string | null) => void;
}

export const useForYou = (): UseForYouReturn => {
    const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
    const [forYouSection, setForYouSection] = useState<RecommendedItem[]>([]);
    const [artistBasedSection, setArtistBasedSection] = useState<RecommendedItem[]>([]);
    const [genreBasedSection, setGenreBasedSection] = useState<RecommendedItem[]>([]);

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

    // Load on mount
    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    const refresh = useCallback(async () => {
        await loadRecommendations();
    }, [loadRecommendations]);

    return {
        recommendations,
        forYouSection,
        artistBasedSection,
        genreBasedSection,
        isLoading,
        error,
        isEmpty,
        refresh,
        selectedTrackId,
        setSelectedTrackId
    };
};
