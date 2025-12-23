import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

// 👇 1. UPDATE THIS PATH to where you saved your "PlaylistTest.tsx"
import PlaylistTest from '../components/PlaylistTest';

// 👇 2. UPDATE THIS PATH to where you saved your "CommentDebugger.tsx"
import CommentDebugger from '../components/comment_debugger';
import CommentManager from '../components/CommentManager';

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

                {/* --- Env Var Debugger --- */}
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800 inline-block text-left shadow-lg">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Environment Check</h3>
                    <div className="flex flex-col gap-2 text-sm font-mono">
                        {/* URL Check */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between gap-8">
                                <span className="text-gray-400">VITE_SUPABASE_URL:</span>
                                <span className={import.meta.env.VITE_SUPABASE_URL ? "text-green-400" : "text-red-500"}>
                                    {import.meta.env.VITE_SUPABASE_URL ? "Present" : "Missing"}
                                </span>
                            </div>
                        </div>

                        {/* Key Check */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between gap-8">
                                <span className="text-gray-400">VITE_SUPABASE_ANON_KEY:</span>
                                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-400" : "text-red-500"}>
                                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Auth Debugger --- */}
                <div className="mt-4 ml-4 p-4 bg-gray-900 rounded-lg border border-gray-800 inline-block text-left align-top shadow-lg">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Auth Status</h3>
                    <div className="flex flex-col gap-1 text-sm font-mono">
                        <div className="flex justify-between gap-8">
                            <span className="text-gray-400">Status:</span>
                            <span className={session ? "text-green-400" : "text-yellow-500"}>
                                {session ? "Logged In" : "Logged Out (Anonymous)"}
                            </span>
                        </div>
                        {session && (
                            <>
                                <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-gray-800">
                                    <span className="text-gray-500 text-xs">User ID:</span>
                                    <span className="text-gray-300 text-xs break-all">{session.user.id}</span>
                                </div>
                                <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-gray-800">
                                    <span className="text-gray-500 text-xs">App Metadata (Role):</span>
                                    <pre className="text-gray-300 text-xs break-all whitespace-pre-wrap">
                                        {JSON.stringify(session.user.app_metadata, null, 2)}
                                    </pre>
                                </div>
                                <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-gray-800">
                                    <span className="text-gray-500 text-xs">User Metadata (Editable):</span>
                                    <pre className="text-gray-300 text-xs break-all whitespace-pre-wrap">
                                        {JSON.stringify(session.user.user_metadata, null, 2)}
                                    </pre>
                                </div>
                            </>
                        )}
                    </div>
                </div>
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
                    </div>
                </div>

            </div>
        </div>
    )
};

export default TestingGround;