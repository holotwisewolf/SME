import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const CommentManager: React.FC = () => {
    const [deleteId, setDeleteId] = useState('');
    const [deleteContent, setDeleteContent] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev]);
    };

    // Delete single comment by ID
    const handleDeleteById = async () => {
        if (!deleteId.trim()) return;
        setIsProcessing(true);
        addLog(`Attempting to delete comment with ID: ${deleteId}`);

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', deleteId);

            if (error) throw error;
            addLog(`Successfully deleted comment ${deleteId}`);
            setDeleteId('');
        } catch (err: any) {
            addLog(`Error deleting by ID: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Bulk delete by exact content match
    const handleDeleteByContent = async () => {
        if (!deleteContent.trim()) return;
        setIsProcessing(true);
        addLog(`Searching for comments with content: "${deleteContent}"`);

        try {
            // First find IDs to report how many we're deleting
            const { data: comments, error: searchError } = await supabase
                .from('comments')
                .select('id')
                .eq('content', deleteContent);

            if (searchError) throw searchError;

            if (!comments || comments.length === 0) {
                addLog('No matching comments found.');
                setIsProcessing(false);
                return;
            }

            const count = comments.length;
            addLog(`Found ${count} matching comments. Deleting...`);

            // Delete them
            const { error: deleteError } = await supabase
                .from('comments')
                .delete()
                .eq('content', deleteContent);

            if (deleteError) throw deleteError;

            addLog(`Successfully deleted ${count} comments.`);
            setDeleteContent('');
        } catch (err: any) {
            addLog(`Error deleting by content: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-3xl mt-4">
            <h2 className="text-xl font-bold mb-4 text-red-400">Comment Admin Tools</h2>

            <div className="grid grid-cols-2 gap-6">
                {/* Delete by ID */}
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <h3 className="text-gray-300 font-bold mb-2">Delete by ID</h3>
                    <div className="flex flex-col gap-2">
                        <input
                            className="bg-gray-800 border border-gray-600 p-2 rounded text-white text-sm"
                            value={deleteId}
                            onChange={e => setDeleteId(e.target.value)}
                            placeholder="Comment UUID"
                        />
                        <button
                            onClick={handleDeleteById}
                            disabled={isProcessing || !deleteId}
                            className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800/50 px-4 py-2 rounded text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            Delete ID
                        </button>
                    </div>
                </div>

                {/* Delete by Content */}
                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                    <h3 className="text-gray-300 font-bold mb-2">Bulk Delete by Content</h3>
                    <div className="flex flex-col gap-2">
                        <input
                            className="bg-gray-800 border border-gray-600 p-2 rounded text-white text-sm"
                            value={deleteContent}
                            onChange={e => setDeleteContent(e.target.value)}
                            placeholder="Exact content match..."
                        />
                        <button
                            onClick={handleDeleteByContent}
                            disabled={isProcessing || !deleteContent}
                            className="bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800/50 px-4 py-2 rounded text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            Delete All Matches
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs */}
            <div className="mt-4 bg-black p-3 rounded border border-gray-700 font-mono text-xs text-yellow-500 h-32 overflow-y-auto">
                <div className="sticky top-0 bg-black pb-1 border-b border-gray-800 mb-2 text-gray-500 uppercase font-bold">Operation Logs</div>
                {logs.length === 0 && <span className="text-gray-700 italic">Ready for operations...</span>}
                {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
};

export default CommentManager;
