import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

// 👇 1. UPDATE THIS PATH to where you saved your "PlaylistTest.tsx"
import PlaylistTest from '../components/PlaylistTest';

// 👇 2. UPDATE THIS PATH to where you saved your "CommentDebugger.tsx"
import CommentDebugger from '../components/comment_debugger';
import CommentManager from '../components/CommentManager';
import TagManager from '../components/TagManager';
import UserManager from '../components/UserManager';

const TestingGround: React.FC = () => {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-full bg-[#121212] flex flex-col items-center p-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Dev Zone</h1>
                <p className="text-gray-400">Independent environment for testing backend services.</p>

                {/* --- Status Cards Row --- */}
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {/* Environment Check Card */}
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-left shadow-lg min-w-[200px]">
                        <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Environment</h3>
                        <div className="flex flex-col gap-2 text-sm font-mono">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">SUPABASE_URL:</span>
                                <span className={import.meta.env.VITE_SUPABASE_URL ? "text-green-400" : "text-red-500"}>
                                    {import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗"}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">ANON_KEY:</span>
                                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-400" : "text-red-500"}>
                                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓" : "✗"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Auth Status Card */}
                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-left shadow-lg min-w-[200px]">
                        <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Auth Status</h3>
                        <div className="flex flex-col gap-1 text-sm font-mono">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Status:</span>
                                <span className={session ? "text-green-400" : "text-yellow-500"}>
                                    {session ? "Logged In" : "Anonymous"}
                                </span>
                            </div>
                            {session && (
                                <>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Role:</span>
                                        <span className="text-blue-400">{session.user.app_metadata?.app_role || 'user'}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">User:</span>
                                        <span className="text-gray-300">{session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'N/A'}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* User ID Card (only if logged in) */}
                    {session && (
                        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 text-left shadow-lg">
                            <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">User ID</h3>
                            <code className="text-xs text-gray-400 font-mono break-all">{session.user.id}</code>
                        </div>
                    )}
                </div>

                {/* Collapsible Metadata Section */}
                {session && (
                    <details className="mt-4 text-left max-w-2xl mx-auto">
                        <summary className="cursor-pointer text-gray-500 text-xs font-bold uppercase hover:text-gray-400 transition-colors">
                            View Full Metadata
                        </summary>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                <span className="text-gray-500 text-xs font-bold">App Metadata</span>
                                <pre className="text-gray-300 text-xs mt-1 overflow-x-auto">{JSON.stringify(session.user.app_metadata, null, 2)}</pre>
                            </div>
                            <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                <span className="text-gray-500 text-xs font-bold">User Metadata</span>
                                <pre className="text-gray-300 text-xs mt-1 overflow-x-auto">{JSON.stringify(session.user.user_metadata, null, 2)}</pre>
                            </div>
                        </div>
                    </details>
                )}
            </div>

            {/* --- MAIN TESTING AREA --- */}
            <div className="mt-8 w-full max-w-4xl space-y-12 pb-20">

                {/* 1. PLAYLIST TEST (Fixing the 400 Error) */}
                <div className="border border-gray-800 p-6 rounded-xl bg-[#1a1a1a]">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-2">
                        <div className="bg-green-900 text-green-300 text-xs font-bold px-2 py-1 rounded">PRIORITY</div>
                        <h2 className="text-xl font-bold text-[#FFD1D1]">1. Playlist & Favourites Test</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                        Use the <strong>"Force String ID"</strong> checkbox here to verify the fix for the 400 Bad Request error.
                    </p>

                    {/* Render your component here */}
                    <PlaylistTest />
                </div>

                {/* 2. COMMENTS DEBUGGER */}
                <div className="border border-gray-800 p-6 rounded-xl bg-[#1a1a1a]">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-2">
                        <h2 className="text-xl font-bold text-blue-400">2. Comment Services</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                        Testing CRUD operations and real-time listeners.
                    </p>

                    {/* Render your component here */}
                    <CommentDebugger />
                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <CommentManager />
                        <TagManager />
                    </div>
                </div>

                {/* 3. USER MANAGER (Danger Zone) */}
                <div className="border border-red-800 p-6 rounded-xl bg-[#1a1a1a]">
                    <div className="flex items-center gap-3 mb-4 border-b border-red-700 pb-2">
                        <div className="bg-red-900 text-red-300 text-xs font-bold px-2 py-1 rounded">DANGER</div>
                        <h2 className="text-xl font-bold text-red-400">3. User Manager</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                        Lookup and delete users by username or UUID. <strong className="text-red-400">Use with caution!</strong>
                    </p>

                    <UserManager />
                </div>

            </div>
        </div>
    )
};

export default TestingGround;