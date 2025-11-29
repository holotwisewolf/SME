// Playlist Types
export interface Playlist {
    id: string;
    name: string;
    description?: string;
    image_url?: string; // Changed to match Supabase column convention if possible, or keep camelCase and map it
    track_count: number; // Mapped from DB count
    is_public: boolean;
    owner_id: string;
    created_at?: string;
}

export interface PlaylistTrack {
    playlist_id: string;
    track_id: string;
    added_at: string;
    // We might want to store some track metadata in the join table for faster loading
    // or fetch it from Spotify API on demand.
    // For now, let's assume we fetch details from Spotify.
}

export interface CreatePlaylistRequest {
    name: string;
    description?: string;
    is_public: boolean;
    image_url?: string;
}

export interface AddTrackToPlaylistRequest {
    playlistId: string;
    trackId: string;
}
