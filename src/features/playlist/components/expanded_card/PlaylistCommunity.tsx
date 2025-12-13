import React from 'react';

interface PlaylistCommunityProps {
    comments: any[];
    newComment: string;
    setNewComment: (comment: string) => void;
    handleAddComment: () => void;
    commentLoading: boolean;
    ratingData: { average: number; count: number };
    tags: string[];
}

export const PlaylistCommunity: React.FC<PlaylistCommunityProps> = ({
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    commentLoading,
    ratingData,
    tags
}) => {
    return (
        <div className="flex flex-col h-full">
            {/* Global Rating Header */}
            <div className="flex items-center justify-between mb-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-white font-bold text-lg">Global Rating</h3>
                    <p className="text-gray-400 text-xs">Based on {ratingData.count} user ratings</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-[white]">
                        {Number.isInteger(ratingData.average) ? ratingData.average : ratingData.average.toFixed(1)}
                    </span>
                    <div className="flex flex-col">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(ratingData.average) ? 'fill-current' : 'text-gray-600 fill-none'}`}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">out of 5</span>
                    </div>
                </div>
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 mb-4 flex-shrink-0">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment..."
                    className="flex-1 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[white]/60 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="bg-[#FFD1D1] text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#ffc1c1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Post
                </button>
            </div>

            {/* Comments List */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-4 mb-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 hover:bg-white/5 transition-colors p-2 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                        {(comment.profiles?.display_name || comment.profiles?.username)?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white text-sm font-bold">{comment.profiles?.display_name || comment.profiles?.username || 'Unknown'}</span>
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

            {/* Community Tags Section */}
            <div className="mb-2">
                <p className="text-gray-400 text-xs mb-2">Community Tags:</p>
                <div className="bg-white/5 rounded-lg p-2 pt-2.5 border border-white/5 h-[46px] overflow-hidden flex items-center">
                    {tags && tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-xs italic">No tags currently</p>
                    )}
                </div>
            </div>
        </div>
    );
};
