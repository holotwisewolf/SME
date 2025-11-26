// src/services/comment_services.ts

import { supabase } from '../../../lib/supabaseClient';
import type { Comment, ItemType } from '../../../types/app'; // 或者 '../types/supabase'，取决于你把 supabase.ts 放哪了
import type { ICommentService, FetchOptions } from '../../../contracts/comment_contracts';

export type CommentWithProfile = Comment & {
    profiles: {
        username: string | null;
        avatar_url: string | null;
        display_name: string | null;
    } | null;
};

export type CommentWithContext = CommentWithProfile & {
    user_rating: number | null;
};

// ==========================================
// Core Comment Operations
// ==========================================

export async function createComment(
    itemId: string,
    itemType: ItemType,
    content: string,
    parentCommentId?: string
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to comment.');

    const { data, error } = await supabase
        .from('comments')
        .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
            content: content,
            parent_comment_id: parentCommentId || null
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create comment: ${error.message}`);
    return data.id;
}

export async function updateComment(commentId: string, newContent: string) {
    const { data, error } = await supabase
        .from('comments')
        .update({
            content: newContent,
            updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update comment: ${error.message}`);
    return data;
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) throw new Error(`Failed to delete comment: ${error.message}`);
}

export async function getComment(commentId: string): Promise<CommentWithProfile> {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      profiles (
        username,
        avatar_url,
        display_name
      )
    `)
        .eq('id', commentId)
        .single();

    if (error) throw new Error(`Failed to fetch comment: ${error.message}`);
    return data as CommentWithProfile;
}

// ==========================================
// Fetching Comments
// ==========================================


export async function getItemComments(
    itemId: string,
    itemType: ItemType,
    options: FetchOptions = { sortBy: 'recent', limit: 20, offset: 0 }
) {
    let query = supabase
        .from('comments')
        .select(`
      *,
      profiles (
        username,
        avatar_url,
        display_name
      )
    `)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .is('parent_comment_id', null)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1);

    if (options.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch comments: ${error.message}`);
    return data as CommentWithProfile[];
}

export async function getUserComments(
    userId: string,
    options: FetchOptions = { limit: 20, offset: 0 }
) {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', userId)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user comments: ${error.message}`);
    return data;
}

export async function getCommentReplies(parentCommentId: string) {
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      profiles (
        username,
        avatar_url,
        display_name
      )
    `)
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch replies: ${error.message}`);
    return data as CommentWithProfile[];
}

// ==========================================
// Comment Context
// ==========================================

export async function getCommentWithRating(commentId: string): Promise<CommentWithContext> {
    const comment = await getComment(commentId);

    const { data: ratingData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', comment.user_id)
        .eq('item_id', comment.item_id)
        .eq('item_type', comment.item_type)
        .single();

    return {
        ...comment,
        user_rating: ratingData?.rating || null
    };
}

export async function getCommentCount(itemId: string, itemType: ItemType): Promise<number> {
    const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', itemId)
        .eq('item_type', itemType);

    if (error) throw new Error(error.message);
    return count || 0;
}

// ==========================================
// Real-time Updates
// ==========================================

export function subscribeToComments(
    itemId: string,
    itemType: ItemType,
    callback: (payload: Comment) => void
) {
    const channelId = `comments:${itemType}:${itemId}`;

    return supabase
        .channel(channelId)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: `item_id=eq.${itemId}`
            },
            // 🟢 检查点 3: 这里给 payload 加了类型 'any'，消除了 Implicit any 错误
            (payload: any) => {
                const newComment = payload.new as Comment;
                if (newComment.item_type === itemType) {
                    callback(newComment);
                }
            }
        )
        .subscribe();
}

export function unsubscribeFromComments(channel: any) {
    if (channel) {
        supabase.removeChannel(channel);
    }
}

export const CommentService: ICommentService = {
    createComment,
    updateComment,
    deleteComment,
    getComment,
    getItemComments,
    getUserComments,
    getCommentReplies,
    getCommentWithRating,
    getCommentCount,
    subscribeToComments,
    unsubscribeFromComments
};