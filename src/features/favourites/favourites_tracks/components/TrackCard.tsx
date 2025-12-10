import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { SpotifyTrack } from '../../../spotify/type/spotify_types';
import FavButton from '../../../../components/ui/FavButton';
import ExpandButton from '../../../../components/ui/ExpandButton';
import { getItemComments } from '../../../../features/comments/services/comment_services';
import { getPersonalRating } from '../../../../features/ratings/services/rating_services';
import { addToFavourites, removeFromFavourites } from '../../../../features/favourites/services/favourites_services';
import { supabase } from '../../../../lib/supabaseClient';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface TrackCardProps {
    track: SpotifyTrack;
    // rating is now fetched internally
    // isFavourite is passed as initial state
    isFavourite?: boolean;
    onToggleFavourite?: (e: React.MouseEvent) => void;
    onClick: () => void;
}

interface RatingPayload {
    user_id: string;
    rating: number;
    [key: string]: unknown;
}

export const TrackCard: React.FC<TrackCardProps> = ({
    track,
    isFavourite: initialIsFavourite = false,
    onToggleFavourite,
    onClick
}) => {
    // Safety check: return null if track data is invalid
    if (!track || !track.id || !track.name || !track.album || !track.artists) {
        return null;
    }

    const [comment, setComment] = useState<string>("");
    const [userRating, setUserRating] = useState<number | null>(null);
    const [isLiked, setIsLiked] = useState(initialIsFavourite);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let ratingSubscription: RealtimeChannel | null = null;

        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch Comments
                const comments = await getItemComments(track.id, 'track', { limit: 10, sortBy: 'recent' });
                if (isMounted) {
                    if (comments && comments.length > 0) {
                        // Pick a random comment
                        const randomComment = comments[Math.floor(Math.random() * comments.length)];
                        setComment(randomComment.content);
                    } else {
                        setComment("No comments for this track");
                    }
                }

                // 2. Fetch User Rating
                const ratingData = await getPersonalRating(user.id, track.id, 'track');
                if (isMounted) {
                    setUserRating(ratingData ? ratingData.rating : null);
                }

                // 3. Subscribe to Rating Updates
                ratingSubscription = supabase
                    .channel(`public:ratings:track:${track.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'ratings',
                            filter: `item_id=eq.${track.id},item_type=eq.track`,
                        },
                        (payload: RealtimePostgresChangesPayload<RatingPayload>) => {
                            if (payload.new && 'user_id' in payload.new && payload.new.user_id === user.id) {
                                setUserRating(payload.new.rating);
                            } else if (payload.eventType === 'DELETE' && payload.old && 'user_id' in payload.old && payload.old.user_id === user.id) {
                                setUserRating(null);
                            }
                        }
                    )
                    .subscribe();

            } catch (error) {
                console.error("Error fetching track data:", error);
                if (isMounted) setComment("No comments for this track");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            if (ratingSubscription) {
                supabase.removeChannel(ratingSubscription);
            }
        };
    }, [track.id]);

    const handleToggleFavourite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = !isLiked;
        setIsLiked(newStatus); // Optimistic update

        try {
            if (newStatus) {
                await addToFavourites(track.id, 'track');
            } else {
                await removeFromFavourites(track.id, 'track');
            }

            if (onToggleFavourite) {
                onToggleFavourite(e);
            }
        } catch (error) {
            console.error("Error toggling favourite:", error);
            setIsLiked(!newStatus); // Revert on error
        }
    };

    return (
        <motion.div
            onClick={onClick}
            className="group relative bg-[#131313]/80 rounded-xl overflow-hidden cursor-pointer flex flex-col h-full shadow-md transition-all duration-300 border border-transparent hover:border-white/10 hover:bg-[#282828]"
            whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Album Art */}
            <div className="aspect-square w-full relative overflow-hidden shrink-0">
                <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top Right Buttons */}
                <div className="absolute top-2 right-2 z-10">
                    {/* Added h-8 for fixed thin height, px-2 for width, and justify-center */}
                    <div className="flex items-center justify-center h-8 px-2 gap-1 bg-black/20 backdrop-blur-md rounded-xl hover:bg-black transition-colors duration-300">
                        <div className="scale-80 flex items-center">
                            <FavButton isFavourite={isLiked} onClick={handleToggleFavourite} />
                        </div>
                        <div className="scale-80 flex items-center">
                            <ExpandButton onClick={(e) => { e.stopPropagation(); onClick(); }} strokeColor="white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Header: Title & Rating */}
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="font-bold text-white truncate flex-1 text-base">{track.name}</h3>

                    <div className="flex items-center gap-1 shrink-0 bg-black/20 px-1.5 py-1.5 rounded">
                        <Star
                            className={`w-3 h-3 ${userRating ? "text-[#FACC15] fill-[#FACC15]" : "text-gray-500"}`}
                        />
                        {userRating && (
                            <span className="text-xs font-bold text-white">{userRating.toFixed(1)}</span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-[#A7A7A7] truncate mb-4">{track.artists.map((a) => a.name).join(', ')}</p>

                {/* Footer: Rotating Comment */}
                <div className="mt-auto pt-3 border-t border-white/10">
                    <p className="text-xs text-[#A7A7A7] line-clamp-2 italic text-center min-h-[1.5em] flex items-center justify-center">
                        {loading ? <LoadingSpinner className="w-4 h-4" /> : `"${comment}"`}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
