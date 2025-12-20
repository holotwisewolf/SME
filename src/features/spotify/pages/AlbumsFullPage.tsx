import { useAlbumsFullPage } from '../hooks/useAlbumsFullPage';
import { TrackReviewModal } from '../../favourites/favourites_tracks/components/expanded_card/TrackReviewModal';
import { PlaylistSelectCard } from '../components/PlaylistSelectCard';
import { ExpandedAlbumCard } from '../../favourites/favourites_albums/components/expanded_card/ExpandedAlbumCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ViewIcon from '../../../components/ui/ViewIcon';
import { AnimatedLoadingDots } from '../../../components/ui/AnimatedLoadingDots';
import { ResultMenuDropdown } from '../components/ResultMenuDropdown';
import FavButton from '../../../components/ui/FavButton';

export function AlbumsFullPage() {
    const {
        artistName, albumId, search,
        albums,
        albumsWithTracks,
        loading,
        loadingMore,
        total,
        activeMenuId, setActiveMenuId,
        selectedTrack, setSelectedTrack,
        playlistModalTrack, setPlaylistModalTrack,
        selectedAlbum, setSelectedAlbum,
        favoritedAlbums,
        handleLoadMore,
        handleTrackClick,
        handleAlbumClick,
        handleAddToFavourites,
        handleImportAlbumToPlaylist
    } = useAlbumsFullPage();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#696969]">
                <LoadingSpinner className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#696969] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">
                    {albums.length} Albums for '{artistName || (albumId ? 'Album Details' : (search || 'All Albums'))}'
                </h1>

                <div className="space-y-4">
                    {albums.map((album) => {
                        const albumWithTracks = albumsWithTracks.get(album.id);

                        return (
                            <div
                                key={`${album.id}-${albums.indexOf(album)}`}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:bg-[#282828] transition-colors"
                            >
                                <div className="flex gap-4 p-4 pb-0">
                                    {/* Left Side - Album Image & Details */}
                                    <div className="flex-shrink-0 w-48 flex flex-col">

                                        {/* added onclick on the album img */}
                                        <div
                                            onClick={() => handleAlbumClick(album)}
                                            className="cursor-pointer group relative"
                                        >
                                            <img
                                                src={album.images[0]?.url}
                                                alt={album.name}
                                                className="w-full aspect-square object-cover rounded-md mb-3"
                                            />
                                            <ViewIcon />
                                        </div>

                                        {/* Album Actions - Refactored Layout */}
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-white font-semibold text-lg line-clamp-2 flex-1 mr-2">
                                                {album.name}
                                            </h3>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <FavButton
                                                        isFavourite={favoritedAlbums.has(album.id)}
                                                        onClick={() => handleAddToFavourites(album.id, 'album')}
                                                        className={`p-2 rounded-full transition-colors ${favoritedAlbums.has(album.id)
                                                            ? 'text-[#FFD1D1] hover:bg-[#282828]'
                                                            : 'text-gray-400 hover:text-white hover:bg-[#282828]'
                                                            }`}
                                                        style={{ color: favoritedAlbums.has(album.id) ? '#FFD1D1' : undefined }}
                                                        iconClassName="w-5 h-5"
                                                    />
                                                </div>

                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ResultMenuDropdown
                                                        trackId={album.id}
                                                        spotifyUrl={album.external_urls.spotify}
                                                        isOpen={activeMenuId === album.id}
                                                        onToggle={(isOpen) => setActiveMenuId(isOpen ? album.id : null)}
                                                        onAddToFavourites={(id) => handleAddToFavourites(id, 'album')}
                                                        onImportToPlaylist={() => handleImportAlbumToPlaylist(album)}
                                                        type="album"
                                                        hideActions={false}
                                                        showFavourites={false}
                                                        placement="right-start"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-1">
                                            {album.artists.map(a => a.name).join(', ')}
                                        </p>
                                        <p className="text-gray-500 text-xs mb-4">
                                            {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
                                        </p>
                                    </div>

                                    {/* Right Side - Scrollable Track List */}
                                    <div className="flex-1 min-w-0">
                                        <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                            {albumWithTracks ? (
                                                <div className="space-y-1">
                                                    {albumWithTracks.tracks.map((track) => (
                                                        <div
                                                            key={track.id}
                                                            onClick={() => handleTrackClick(track, album)}
                                                            className="flex justify-between items-center px-3 py-2 hover:bg-[#383838] rounded transition-colors group cursor-pointer"
                                                        >
                                                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                                                <span className="text-gray-500 text-sm w-6 text-right flex-shrink-0 group-hover:text-white transition-colors">
                                                                    {track.trackNumber}
                                                                </span>
                                                                <span className="text-white text-sm truncate font-medium">
                                                                    {track.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-500 text-xs flex-shrink-0 ml-4 group-hover:text-gray-300 transition-colors">
                                                                {Math.floor(track.duration / 60000)}:
                                                                {String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                                    <LoadingSpinner className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {albums.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No albums found
                    </div>
                )}

                {/* Load More Button */}
                {albums.length < total && albums.length > 0 && !albumId && (
                    <div className="flex justify-center mt-12 mb-8">
                        {loadingMore ? (
                            <div className="flex flex-col items-center gap-2">
                                <AnimatedLoadingDots color="#ffffff" size={40} />
                            </div>
                        ) : (
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-sm"
                            >
                                Load More
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Track Review Modal */}
            {selectedTrack && (
                <TrackReviewModal
                    track={selectedTrack}
                    onClose={() => setSelectedTrack(null)}
                />
            )}

            {/* Album Expanded Card */}
            {selectedAlbum && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                        onClick={() => setSelectedAlbum(null)}
                    />
                    <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
                        <ExpandedAlbumCard
                            albumId={selectedAlbum.id}
                            onClose={() => setSelectedAlbum(null)}
                        />
                    </div>
                </div>
            )}

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackId={playlistModalTrack.id}
                    trackIds={playlistModalTrack.trackIds}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}
        </div>
    );
}
