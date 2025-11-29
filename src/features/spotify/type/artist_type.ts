// Artist Types
export interface Artist {
    id: string;
    name: string;
    imageUrl?: string;
    genres?: string[];
    popularity?: number;
}

export interface ArtistFullDetail extends Artist {
    followers?: number;
    externalUrl?: string;
    topTracks?: string[];
    relatedArtists?: string[];
}
