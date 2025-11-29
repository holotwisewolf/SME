// Album Types
export interface Album {
    id: string;
    name: string;
    artistName: string;
    artistId: string;
    imageUrl?: string;
    releaseDate?: string;
    totalTracks?: number;
    externalUrl?: string;
}

export interface AlbumTrack {
    id: string;
    name: string;
    trackNumber: number;
    duration: number;
    previewUrl?: string;
}

export interface AlbumWithTracks extends Album {
    tracks: AlbumTrack[];
}
