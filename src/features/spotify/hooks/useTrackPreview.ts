import { useRef, useCallback } from 'react';

// Global audio instance - shared across all components
let globalAudio: HTMLAudioElement | null = null;
let currentTrackId: string | null = null;

/**
 * Hook for managing audio preview playback
 * Ensures only ONE preview plays at a time across the entire app
 */
export function useTrackPreview() {
    const playPreview = useCallback((previewUrl: string, trackId: string) => {
        // Stop current audio if playing
        if (globalAudio) {
            globalAudio.pause();
            globalAudio = null;
        }

        // Don't play if no preview URL
        if (!previewUrl) {
            return;
        }

        // Create and play new audio
        const audio = new Audio(previewUrl);
        audio.volume = 0.5; // Set volume to 50%
        globalAudio = audio;
        currentTrackId = trackId;

        audio.play().catch((error) => {
            console.error('Error playing preview:', error);
        });
    }, []);

    const stopPreview = useCallback(() => {
        if (globalAudio) {
            globalAudio.pause();
            globalAudio = null;
            currentTrackId = null;
        }
    }, []);

    return {
        playPreview,
        stopPreview,
        get currentTrackId() {
            return currentTrackId;
        }
    };
}
