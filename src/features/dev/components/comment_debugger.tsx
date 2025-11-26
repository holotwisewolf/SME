import React, { useState, useEffect } from 'react';
// Ensure the path points to your previously saved service
import {
    createComment,
    getItemComments,
    deleteComment,
    subscribeToComments,
    unsubscribeFromComments,
    type CommentWithProfile
} from '../../comments/services/comment_services';

// Ensure the path points to app.ts
import type { ItemType } from '../../../types/app';

const CommentDebugger: React.FC = () => {
    // State
    const [itemId, setItemId] = useState('test_item_001'); // Default test ID
    const [itemType, setItemType] = useState<ItemType>('track');
    const [content, setContent] = useState('');
    const [commentsList, setCommentsList] = useState<CommentWithProfile[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        // Using standard template literals
        setLogs(prev => [`[${time}] ${msg}`, ...prev]);
    };

    // 1. Fetch
    const handleFetch = async () => {
        try {
            addLog(`Fetching list for ${itemType}:${itemId}...`);
            const data = await getItemComments(itemId, itemType);
            setCommentsList(data || []);
            addLog(`Loaded ${data?.length} comments.`);
        } catch (err: any) {
            addLog(`Fetch Error: ${err.message}`);
        }
    };

    // 2. Create
    const handleCreate = async () => {
        if (!content.trim()) return;
        try {
            addLog('Sending comment...');
            await createComment(itemId, itemType, content);
            addLog('Comment sent!');
            setContent('');
            handleFetch();
        } catch (err: any) {
            addLog(`Create Error: ${err.message}`);
        }
    };

    // 3. Delete
    const handleDelete = async (id: string) => {
        try {
            addLog(`Deleting ${id}...`);
            await deleteComment(id);
            addLog('Deleted.');
            handleFetch();
        } catch (err: any) {
            addLog(`Delete Error: ${err.message}`);
        }
    };

    // 4. Realtime Subscription
    useEffect(() => {
        addLog(`Subscribing to ${itemType}:${itemId}...`);
        const channel = subscribeToComments(itemId, itemType, (newCommentRaw) => {
            // Simple type conversion for display
            const newComment = newCommentRaw as CommentWithProfile;
            addLog(`REALTIME: New message: "${newComment.content}"`);
            setCommentsList(prev => [newComment, ...prev]);
        });

        return () => {
            unsubscribeFromComments(channel);
        };
    }, [itemId, itemType]);

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4 text-green-400">Comment Function Tester</h2>

            {/* Inputs */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <input
                    className="col-span-1 bg-gray-900 border border-gray-600 p-2 rounded text-white"
                    value={itemId}
                    onChange={e => setItemId(e.target.value)}
                    placeholder="Item ID"
                />
                <select
                    className="col-span-1 bg-gray-900 border border-gray-600 p-2 rounded text-white"
                    value={itemType}
                    onChange={e => setItemType(e.target.value as ItemType)}
                >
                    <option value="track">Track</option>
                    <option value="playlist">Playlist</option>
                    <option value="album">Album</option>
                </select>
                <button onClick={handleFetch} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold">
                    Manual Refresh
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    className="flex-1 bg-gray-900 border border-gray-600 p-2 rounded text-white"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write a test comment..."
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 px-6 rounded font-bold text-white">
                    Send
                </button>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 h-80">
                {/* List */}
                <div className="bg-gray-900 p-4 rounded overflow-y-auto border border-gray-700">
                    <h3 className="text-gray-400 font-bold mb-2 sticky top-0 bg-gray-900">Live Comments ({commentsList.length})</h3>
                    {commentsList.map(c => (
                        <div key={c.id} className="mb-2 p-2 bg-gray-800 rounded group border border-gray-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-blue-400 font-bold">{c.profiles?.username || 'User'}</span>
                                <span className="text-gray-500">{new Date(c.created_at || '').toLocaleTimeString()}</span>
                            </div>
                            <p className="text-gray-200 text-sm">{c.content}</p>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className="text-red-500 text-xs mt-2 opacity-0 group-hover:opacity-100 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                {/* Logs */}
                <div className="bg-black p-4 rounded overflow-y-auto border border-gray-700 font-mono text-xs text-green-500">
                    <h3 className="text-gray-500 font-bold mb-2 sticky top-0 bg-black">System Logs</h3>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        </div>
    );
};

export default CommentDebugger;