import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Trash2, AlertTriangle, Search } from 'lucide-react';

const TagManager: React.FC = () => {
    const [tagName, setTagName] = useState('');
    const [tagId, setTagId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    const handleDeleteByName = async () => {
        if (!tagName.trim()) {
            setStatus({ type: 'error', message: 'Please enter a tag name' });
            return;
        }

        if (!confirm(`Are you sure you want to delete all tags with name "${tagName}"? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            // First get the IDs to report how many were deleted
            const { data: tagsToDelete, error: fetchError } = await supabase
                .from('tags')
                .select('id')
                .ilike('name', tagName.trim());

            if (fetchError) throw fetchError;

            if (!tagsToDelete || tagsToDelete.length === 0) {
                setStatus({ type: 'info', message: 'No tags found with that name.' });
                setLoading(false);
                return;
            }

            const { error: deleteError } = await supabase
                .from('tags')
                .delete()
                .ilike('name', tagName.trim());

            if (deleteError) throw deleteError;

            setStatus({
                type: 'success',
                message: `Successfully deleted ${tagsToDelete.length} tag(s) named "${tagName}".`
            });
            setTagName('');
        } catch (err: any) {
            console.error('Error deleting tag:', err);
            setStatus({
                type: 'error',
                message: `Failed to delete tag: ${err.message || 'Unknown error'}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteById = async () => {
        const idToDelete = tagId.trim(); // Store locally

        if (!idToDelete) {
            setStatus({ type: 'error', message: 'Please enter a tag ID' });
            return;
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idToDelete)) {
            setStatus({ type: 'error', message: 'Invalid UUID format' });
            return;
        }

        if (!confirm(`Are you sure you want to delete tag ID "${idToDelete}"?`)) {
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const { error: deleteError } = await supabase
                .from('tags')
                .delete()
                .eq('id', idToDelete); // Use stored ID

            if (deleteError) throw deleteError;

            setStatus({
                type: 'success',
                message: `Successfully deleted tag with ID "${idToDelete}".`
            });
            setTagId('');
        } catch (err: any) {
            console.error('Error deleting tag:', err);
            setStatus({
                type: 'error',
                message: `Failed to delete tag: ${err.message || 'Unknown error'}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-red-500/20 p-6 mt-8">
            <div className="flex items-center gap-3 mb-6 border-b border-red-500/10 pb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h2 className="text-xl font-bold text-red-100">Tag Manager (Admin)</h2>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-200/80">
                    <p className="font-semibold text-red-200 mb-1">Warning: Destructive Actions</p>
                    <p>Deleting tags here will permanently remove them from the database and cascade delete all associated item_tags links. This action cannot be undone.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Delete by Name */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Delete by Name</h3>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Tag Name (Case Insensitive)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    placeholder="e.g. lofi"
                                    className="w-full bg-[#121212] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <button
                                onClick={handleDeleteByName}
                                disabled={loading || !tagName}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {loading ? 'Deleting...' : 'Delete Name'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete by ID */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Delete by ID</h3>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Tag UUID</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagId}
                                onChange={(e) => setTagId(e.target.value)}
                                placeholder="00000000-0000-..."
                                className="flex-1 bg-[#121212] border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500/50 font-mono"
                            />
                            <button
                                onClick={handleDeleteById}
                                disabled={loading || !tagId}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {loading ? 'Deleting...' : 'Delete ID'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {status && (
                <div className={`mt-6 p-3 rounded-lg text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default TagManager;
