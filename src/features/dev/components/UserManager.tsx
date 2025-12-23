import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

/**
 * DEV ONLY: User Manager Component
 * Allows developers to look up and delete users by username or UUID.
 * 
 * WARNING: This uses admin functions that require service role key.
 * For client-side, we'll just delete from profiles table and let cascades handle the rest.
 */
const UserManager: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    const isEmail = (str: string) => {
        return str.includes('@') && str.includes('.');
    };

    const lookupUser = async () => {
        if (!identifier.trim()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        setUserInfo(null);

        try {
            let query = supabase.from('profiles').select('*');

            if (isUUID(identifier)) {
                query = query.eq('id', identifier);
            } else if (isEmail(identifier)) {
                query = query.eq('email', identifier);
            } else {
                query = query.eq('username', identifier);
            }

            // Use maybeSingle() instead of single() to avoid error when no user found
            const { data, error: fetchError } = await query.maybeSingle();

            if (fetchError) {
                setError(`Lookup error: ${fetchError.message}`);
            } else if (!data) {
                setError(`User not found: No user with that ${isUUID(identifier) ? 'UUID' : isEmail(identifier) ? 'email' : 'username'}`);
            } else {
                setUserInfo(data);
            }
        } catch (err: any) {
            setError(err.message || 'Lookup failed');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async () => {
        if (!userInfo) return;

        const confirmed = window.confirm(
            `⚠️ DELETE USER COMPLETELY?\n\nUsername: ${userInfo.username}\nID: ${userInfo.id}\n\nThis will remove ALL data (Auth + Profile). This action cannot be undone!`
        );

        if (!confirmed) return;

        setLoading(true);
        setError(null);

        try {
            // Use RPC for complete deletion
            const { data, error } = await (supabase.rpc as any)('delete_user_completely', {
                target_user_id: userInfo.id
            });

            if (error) {
                console.error('Delete error:', error);
                throw error;
            }

            if (!data?.success) {
                throw new Error(data?.error || 'Deletion failed');
            }

            setSuccess(`User "${userInfo.username}" completely deleted!`);
            setUserInfo(null);
            setIdentifier('');
        } catch (err: any) {
            setError(`Delete failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-400">⚠️ User Manager (Danger Zone)</h3>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter username, email, or UUID"
                    className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <button
                    onClick={lookupUser}
                    disabled={loading || !identifier.trim()}
                    className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50 transition"
                >
                    {loading ? 'Looking...' : 'Lookup'}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-900/30 border border-green-500/50 rounded text-green-300 text-sm">
                    {success}
                </div>
            )}

            {userInfo && (
                <div className="p-4 bg-[#2a2a2a] rounded-lg border border-gray-700">
                    <h4 className="text-white font-bold mb-3">User Found:</h4>
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-gray-400">ID:</span>
                            <span className="text-gray-200">{userInfo.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Username:</span>
                            <span className="text-gray-200">@{userInfo.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Display Name:</span>
                            <span className="text-gray-200">{userInfo.display_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Email:</span>
                            <span className="text-gray-200">{userInfo.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Created:</span>
                            <span className="text-gray-200">{new Date(userInfo.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={deleteUser}
                        disabled={loading}
                        className="w-full mt-4 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : '🗑️ Delete This User'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserManager;
