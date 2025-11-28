// Playlist Types
export interface Playlist {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    trackCount: number;
    isPublic: boolean;
    ownerId: string;
}

export interface PlaylistTrack {
    trackId: string;
    addedAt: Date;
}

export interface CreatePlaylistRequest {
    name: string;
    description?: string;
    isPublic: boolean;
}

export interface AddTrackToPlaylistRequest {
    playlistId: string;
    trackId: string;
}
