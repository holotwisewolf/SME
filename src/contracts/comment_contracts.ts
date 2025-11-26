import type { Comment, ItemType } from '../types/app';
import type { CommentWithProfile, CommentWithContext } from '../features/comments/services/comment_services';

export interface FetchOptions {
    sortBy?: 'recent' | 'oldest';
    limit?: number;
    offset?: number;
}

export interface ICommentService {
    createComment(itemId: string, itemType: ItemType, content: string, parentCommentId?: string): Promise<string>;
    updateComment(commentId: string, newContent: string): Promise<any>;
    deleteComment(commentId: string): Promise<void>;
    getComment(commentId: string): Promise<CommentWithProfile>;
    getItemComments(itemId: string, itemType: ItemType, options?: FetchOptions): Promise<CommentWithProfile[]>;
    getUserComments(userId: string, options?: FetchOptions): Promise<any[]>;
    getCommentReplies(parentCommentId: string): Promise<CommentWithProfile[]>;
    getCommentWithRating(commentId: string): Promise<CommentWithContext>;
    getCommentCount(itemId: string, itemType: ItemType): Promise<number>;
    subscribeToComments(itemId: string, itemType: ItemType, callback: (payload: Comment) => void): any;
    unsubscribeFromComments(channel: any): void;
}
