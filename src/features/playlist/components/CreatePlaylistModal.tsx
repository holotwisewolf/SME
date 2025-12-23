import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPlaylist } from '../services/playlist_services';

import Checkbox from '../../../components/ui/CheckboxIcon';

interface CreatePlaylistModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        // [NEW] Check auth before proceeding
        const { data: { user } } = await import('../../../lib/supabaseClient').then(m => m.supabase.auth.getUser());
        if (!user) {
            setLoading(false);
            // This error handles the "anon" case
            setError('You must be logged in to create a playlist.');
            return;
        }

        try {
            await createPlaylist({
                name,
                description,
                is_public: isPublic
            });
            onCreated();
            onClose();
        } catch (err) {
            console.error('Error creating playlist:', err);
            setError('Failed to create playlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#181818] rounded-xl border border-white/10 p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold text-white mb-6">Create New Playlist</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#2a2a2a] border border-white/20 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#2a2a2a] border border-white/20 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none h-24"
                                placeholder="Add an optional description"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox
                                checked={isPublic}
                                onChange={setIsPublic}
                                label="Public Playlist"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="px-6 py-2 bg-[#FFD1D1] hover:bg-[#ffc2c2] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
