import React from 'react';

interface PlaylistCommentsProps {
    comments: any[];
    newComment: string;
    setNewComment: (comment: string) => void;
    handleAddComment: () => void;
    commentLoading: boolean;
}

export const PlaylistComments: React.FC<PlaylistCommentsProps> = ({
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    commentLoading
}) => {
    return (
        <div className="flex flex-col h-full">
            {/* Comment Input */}
            <div className="flex gap-2 mb-4 flex-shrink-0">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment..."
                    className="flex-1 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1DB954] text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-[#1DB954] text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Post
                </button>
            </div>

            {/* Comments List */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                        {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white text-sm font-bold">{comment.profiles?.username || 'Unknown'}</span>
                                    <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>No comments yet. Be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
