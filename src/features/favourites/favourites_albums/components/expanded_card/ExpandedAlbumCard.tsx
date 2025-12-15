import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import { useError } from '../../../../../context/ErrorContext';
import { useSuccess } from '../../../../../context/SuccessContext';
import { getAlbum, getAlbumTracks } from '../../../../spotify/services/spotify_services';
import { getItemTags } from '../../../../tags/services/tag_services';
import { getItemRating, getUserItemRating, getItemComments, addItemComment } from '../../../services/item_services';
import { removeFromFavourites } from '../../../services/favourites_services';
import { AlbumHeader } from './AlbumHeader';
import { AlbumTracks } from './AlbumTracks';
import { AlbumCommunity } from './AlbumCommunity';
import { AlbumSettings } from './AlbumSettings';
import { AlbumReview } from './AlbumReview';
import ExpandButton from '../../../../../components/ui/ExpandButton';
import { AlbumTrackDetailModal } from './AlbumTrackDetailModal';
import { supabase } from '../../../../../lib/supabaseClient';
import { PlaylistSelectCard } from '../../../../spotify/components/PlaylistSelectCard';

interface ExpandedAlbumCardProps {
    albumId: string;
    onClose?: () => void;
    onRemove?: () => void;
}

type ActiveTab = 'tracks' | 'review' | 'community' | 'settings';

export const ExpandedAlbumCard: React.FC<ExpandedAlbumCardProps> = ({ albumId, onClose, onRemove }) => {
    const { showError } = useError();
    const { showSuccess } = useSuccess();
    const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
    const [loading, setLoading] = useState(true);

    // Data States
    const [album, setAlbum] = useState<any>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState<number | null>(null);
    const [userName, setUserName] = useState('You');
    const [comments, setComments] = useState<any[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Interaction States
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [playlistModalTrack, setPlaylistModalTrack] = useState<{ name: string; trackIds: string[] } | null>(null);

    const filteredTracks = tracks.filter(track =>
        (track.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artists?.some((a: any) => (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        loadData();
    }, [albumId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const [albumData, tracksData, commentsData] = await Promise.all([
                getAlbum(albumId),
                getAlbumTracks(albumId),
                getItemComments(albumId, 'album')
            ]);

            setAlbum(albumData);
            setTracks(tracksData.items || tracksData || []);
            setComments(commentsData);

            // Fetch tags and ratings after albumData is available
            const [tagsData, ratingRes, userRatingRes] = await Promise.all([
                getItemTags(albumId, 'album'),
                getItemRating(albumId, 'album'),
                user ? getUserItemRating(albumId, 'album') : Promise.resolve(null) // Only fetch user rating if user is logged in
            ]);

            setTags(tagsData.map(tag => tag.name));
            setRatingData(ratingRes);
            setUserRating(userRatingRes);

            // Fetch user profile for display name if user is logged in
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('display_name, username')
                    .eq('id', user.id)
                    .single();

                setUserName(profileData?.display_name || profileData?.username || 'You');
            } else {
                setUserName('You'); // Default if not logged in
            }

        } catch (error) {
            console.error('Error loading album details:', error);
            showError('Failed to load album details');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingUpdate = async () => {
        const [ratingRes, userRatingRes] = await Promise.all([
            getItemRating(albumId, 'album'),
            getUserItemRating(albumId, 'album')
        ]);
        setRatingData(ratingRes);
        setUserRating(userRatingRes);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            await addItemComment(albumId, 'album', newComment);
            showSuccess('Comment posted');
            setNewComment('');
            const commentsData = await getItemComments(albumId, 'album');
            setComments(commentsData);
        } catch (error) {
            console.error('Error adding comment:', error);
            showError('Failed to post comment');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleRemoveFromFavourites = async () => {
        if (window.confirm('Remove this album from your favourites?')) {
            try {
                await removeFromFavourites(albumId, 'album');
                showSuccess('Album removed from favourites');
                if (onRemove) {
                    onRemove();
                }
                if (onClose) {
                    onClose();
                }
            } catch (error) {
                console.error('Error removing from favourites:', error);
                showError('Failed to remove album');
            }
        }
    };

    const handleImportToPlaylist = () => {
        if (tracks.length > 0) {
            const trackIds = tracks.map((t: any) => t.id).filter(Boolean);
            setPlaylistModalTrack({
                name: album?.name || 'Album',
                trackIds: trackIds
            });
        }
    };


    const handleTrackClick = (track: any) => {
        setSelectedTrack(track);
    };

    if (loading || !album) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="flex items-center justify-center w-full max-w-5xl h-[500px] bg-[#1e1e1e] rounded-2xl shadow-2xl border border-white/5 mx-auto" onClick={(e) => e.stopPropagation()}>
                    <LoadingSpinner className="w-12 h-12 text-[white]" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="flex flex-col md:flex-row bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl mx-auto border border-white/5 relative h-[515px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <ExpandButton
                        onClick={onClose}
                        className="rotate-180 hover:bg-white/10 rounded-full p-1"
                        strokeColor="white"
                        title="Collapse"
                    />
                </div>

                {/* Left Column - Header */}
                <AlbumHeader
                    albumId={albumId}
                    album={album}
                    ratingData={ratingData}
                    userRating={userRating}
                    tags={tags}
                    onRatingUpdate={handleRatingUpdate}
                    userName={userName}
                />

                {/* Right Column */}
                <div className="w-full md:w-[65%] p-6 flex flex-col bg-transparent overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 mb-6 bg-black/20 p-1 rounded-full w-max flex-shrink-0">
                        {(['tracks', 'review', 'community', 'settings'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))
                        }
                    </div>

                    {/* Search Bar */}
                    {
                        activeTab === 'tracks' && (
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search in album..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#151515]/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[white]/40 transition-colors"
                                />
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        )
                    }

                    {/* Content Panel */}
                    <div className="flex-1 bg-[#151515]/80 rounded-xl border border-white/5 p-4 shadow-inner overflow-hidden flex flex-col backdrop-blur-sm">
                        {activeTab === 'tracks' && (
                            <AlbumTracks
                                tracks={filteredTracks}
                                albumImage={album.images?.[0]?.url}
                                onTrackClick={handleTrackClick}
                            />
                        )}

                        {activeTab === 'review' && (
                            <AlbumReview
                                albumId={albumId}
                                album={album}
                                userRating={userRating}
                                tags={tags}
                                setTags={setTags}
                                onRatingUpdate={handleRatingUpdate}
                            />
                        )}

                        {activeTab === 'community' && (
                            <AlbumCommunity
                                comments={comments}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                handleAddComment={handleAddComment}
                                commentLoading={commentLoading}
                                ratingData={ratingData}
                                tags={tags}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <AlbumSettings
                                albumSpotifyUrl={album.external_urls?.spotify}
                                onRemove={handleRemoveFromFavourites}
                                onImportToPlaylist={handleImportToPlaylist}
                            />
                        )}
                    </div>
                </div >
            </div >

            {/* Track Detail Modal */}
            {
                selectedTrack && (
                    <AlbumTrackDetailModal
                        track={selectedTrack}
                        onClose={() => setSelectedTrack(null)}
                    />
                )
            }

            {/* Playlist Selection Modal */}
            {playlistModalTrack && (
                <PlaylistSelectCard
                    trackIds={playlistModalTrack.trackIds}
                    trackName={playlistModalTrack.name}
                    onClose={() => setPlaylistModalTrack(null)}
                />
            )}
        </div >
    );
};
