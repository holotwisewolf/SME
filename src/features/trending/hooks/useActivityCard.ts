import { useCallback } from 'react';

export interface ActivityItem {
    id: string;
    type: 'rating' | 'comment' | 'favorite' | 'tag';
    created_at: string;
    value?: number;
    content?: string;
    tag_name?: string;

    itemType?: string;
    item_type?: string;

    item_id?: string;

    user?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    track?: {
        id: string;
        title: string;
        artist: string;
        artistId?: string;
        artist_id?: string;
        user_id?: string;
        albumId?: string;
    };
}

export interface UseActivityCardProps {
    activity: ActivityItem;
    onTrackClick?: (id: string) => void;
    onArtistClick?: (idOrName: string) => void;
    onAlbumClick?: (id: string) => void;
    onPlaylistClick?: (id: string) => void;
    onUserClick?: (userId: string) => void;
}

export const useActivityCard = ({
    activity,
    onTrackClick,
    onArtistClick,
    onAlbumClick,
    onPlaylistClick,
    onUserClick
}: UseActivityCardProps) => {

    // Resolve activity type and ensure lowercase for matching
    const type = (activity.itemType || activity.item_type || activity.type || '').toLowerCase();
    const itemId = activity.track?.id || activity.item_id;

    const getRelativeTime = useCallback((dateString: string) => {
        if (!dateString) return '';
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    }, []);

    const getActionText = useCallback(() => {
        const activityType = (activity.type || '').toLowerCase();
        const itemTypeLower = type;

        switch (activityType) {
            case 'rating': return `rated`;
            case 'comment': return `commented on`;
            case 'favorite': return `favourited`;
            case 'tag': {
                const itemLabel = itemTypeLower === 'playlist' ? 'a playlist'
                    : itemTypeLower === 'album' ? 'an album'
                        : 'a track';
                return `tagged ${itemLabel}`;
            }
            default:
                return 'interacted with';
        }
    }, [activity.type, type]);

    const resolvedRightId = type === 'playlist'
        ? activity.track?.user_id
        : (activity.track?.artistId || activity.track?.artist_id);

    const handleLeftNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activity.user?.id && onUserClick) {
            onUserClick(activity.user.id);
        }
    };

    const handleRightNameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'playlist') {
            if (resolvedRightId && onUserClick) {
                onUserClick(resolvedRightId);
            }
        } else {
            if (resolvedRightId) {
                onArtistClick?.(resolvedRightId);
            } else if (activity.track?.artist) {
                onArtistClick?.(activity.track.artist);
            }
        }
    };

    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (type === 'playlist' && itemId) {
            onPlaylistClick?.(itemId);
            return;
        }
        if (type === 'album' && (itemId || activity.track?.albumId)) {
            onAlbumClick?.(itemId || activity.track?.albumId!);
        } else if (itemId) {
            onTrackClick?.(itemId);
        }
    };

    return {
        type,
        displayName: activity.user?.display_name || 'Anonymous',
        title: activity.track?.title || 'Unknown Title',
        artistName: activity.track?.artist || 'Unknown Artist',
        resolvedRightId,
        getRelativeTime,
        getActionText,
        handleLeftNameClick,
        handleRightNameClick,
        handleTitleClick
    };
};
