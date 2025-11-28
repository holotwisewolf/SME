import React from 'react';

interface TrackPreviewAudioProps {
    trackId: string;
    previewUrl?: string;
    onPlayPreview: (previewUrl: string, trackId: string) => void;
    onStopPreview: () => void;
    children: React.ReactNode;
}

/**
 * Wrapper component that handles audio preview on hover
 */
export function TrackPreviewAudio({
    trackId,
    previewUrl,
    onPlayPreview,
    onStopPreview,
    children
}: TrackPreviewAudioProps) {
    const handleMouseEnter = () => {
        if (previewUrl) {
            onPlayPreview(previewUrl, trackId);
        }
    };

    const handleMouseLeave = () => {
        onStopPreview();
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
}
