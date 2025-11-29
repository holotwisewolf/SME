// Favourites Types

export interface FavouriteTrack {
    user_id: string;
    track_id: string;
    added_at: string;
}

export interface FavouriteAlbum {
    user_id: string;
    album_id: string;
    added_at: string;
}

export interface FavouriteArtist {
    user_id: string;
    artist_id: string;
    added_at: string;
}
