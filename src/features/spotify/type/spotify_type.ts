export interface ISpotifyService {
    searchTracks(query: string, limit?: number): Promise<any[]>;
    searchAlbums(query: string, limit?: number): Promise<any[]>;
    searchArtists(query: string, limit?: number): Promise<any[]>;
    searchAll(query: string, limit?: number): Promise<{ tracks: any[], albums: any[], artists: any[] }>;
    getAlbumDetails(albumId: string): Promise<any>;
    getTrackDetails(trackId: string): Promise<any>;
    getArtistDetails(artistId: string): Promise<any>;
    getMultipleTracks(trackIds: string[]): Promise<any>;
    getMultipleAlbums(albumIds: string[]): Promise<any>;

    getTrackPreview(trackId: string): Promise<string | null>;
    generateSpotifyLink(resourceId: string, type: 'track' | 'album' | 'artist' | 'playlist'): string;
    extractSpotifyId(input: string): string | null;
    formatDuration(ms: number): string;
}
