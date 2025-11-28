import type { Playlist, CreatePlaylistRequest, AddTrackToPlaylistRequest } from '../contracts/playlist_contract';

// Stub data for playlists (replace with actual API calls later)
const mockPlaylists: Playlist[] = [
    {
        id: '1',
        name: 'My Playlist 1',
        description: 'First playlist',
        trackCount: 10,
        isPublic: true,
        ownerId: 'user123'
    },
    {
        id: '2',
        name: 'My Playlist 2',
        description: 'Second playlist',
        trackCount: 5,
        isPublic: false,
        ownerId: 'user123'
    }
];

/**
 * Get all playlists for the current user
 */
export async function getUserPlaylists(): Promise<Playlist[]> {
    // TODO: Replace with actual API call
    return Promise.resolve(mockPlaylists);
}

/**
 * Create a new playlist
 */
export async function createPlaylist(request: CreatePlaylistRequest): Promise<Playlist> {
    // TODO: Replace with actual API call
    const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: request.name,
        description: request.description,
        trackCount: 0,
        isPublic: request.isPublic,
        ownerId: 'user123'
    };
    mockPlaylists.push(newPlaylist);
    return Promise.resolve(newPlaylist);
}

/**
 * Add a track to a playlist
 */
export async function addTrackToPlaylist(request: AddTrackToPlaylistRequest): Promise<void> {
    // TODO: Replace with actual API call
    console.log(`Adding track ${request.trackId} to playlist ${request.playlistId}`);
    return Promise.resolve();
}

/**
 * Add a track to favourites
 */
export async function addToFavourites(trackId: string): Promise<void> {
    // TODO: Replace with actual API call
    console.log(`Adding track ${trackId} to favourites`);
    return Promise.resolve();
}
