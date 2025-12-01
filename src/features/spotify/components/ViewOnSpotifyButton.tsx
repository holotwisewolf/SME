import React from 'react';
import SpotifyIcon from '../../../components/ui/SpotifyIcon';

interface ViewOnSpotifyButtonProps {
    spotifyUrl: string;
    label?: string;
    className?: string;
}

export const ViewOnSpotifyButton: React.FC<ViewOnSpotifyButtonProps> = ({
    spotifyUrl,
    label = "View on Spotify",
    className = ""
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(spotifyUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className={`bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${className}`}
        >
            <SpotifyIcon size={20} color="currentColor" />
            {label}
        </button>
    );
};
