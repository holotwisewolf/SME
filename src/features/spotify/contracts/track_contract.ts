// Track Types
export interface Track {
    id: string;
    name: string;
    artistName: string;
    artistId: string;
    albumName: string;
    albumId: string;
    albumImageUrl?: string;
    duration: number;
    previewUrl?: string;
    externalUrl?: string;
    popularity?: number;
}

export interface TrackPreview {
    trackId: string;
    previewUrl: string;
}
