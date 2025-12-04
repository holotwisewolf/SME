export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyArtist {
    id: string;
    name: string;
    images: SpotifyImage[];
    genres: string[];
    followers: { total: number };
    external_urls: { spotify: string };
    uri: string;
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    artists: {
        id: string;
        name: string;
    }[];
    images: SpotifyImage[];
    release_date: string;
    total_tracks: number;
    external_urls: { spotify: string };
    uri: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: {
        id: string;
        name: string;
    }[];
    album: {
        id: string;
        name: string;
        images: SpotifyImage[];
        release_date: string;
    };
    duration_ms: number;
    preview_url: string | null;
    external_urls: { spotify: string };
    uri: string;
}
