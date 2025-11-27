import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import CommentDebugger from '../components/comment_debugger';

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

                {/* Env Var Debugger */}
                <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800 inline-block text-left">
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
                            {import.meta.env.VITE_SUPABASE_URL && (
                                <div className="text-xs pl-4 border-l border-gray-700">
                                    <span className="text-gray-500">Format: </span>
                                    {(() => {
                                        try {
                                            new URL(import.meta.env.VITE_SUPABASE_URL);
                                            return <span className="text-green-400">Valid URL</span>;
                                        } catch {
                                            return <span className="text-red-500">Invalid URL</span>;
                                        }
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Key Check */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between gap-8">
                                <span className="text-gray-400">VITE_SUPABASE_ANON_KEY:</span>
                                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-400" : "text-red-500"}>
                                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"}
                                </span>
                            </div>
                            {import.meta.env.VITE_SUPABASE_ANON_KEY && (
                                <div className="text-xs pl-4 border-l border-gray-700">
                                    <span className="text-gray-500">Length: </span>
                                    {import.meta.env.VITE_SUPABASE_ANON_KEY.length >= 20 ? (
                                        <span className="text-green-400">OK ({import.meta.env.VITE_SUPABASE_ANON_KEY.length} chars)</span>
                                    ) : (
                                        <span className="text-red-500">Too Short ({import.meta.env.VITE_SUPABASE_ANON_KEY.length} chars)</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Auth Debugger */}
                <div className="mt-4 ml-4 p-4 bg-gray-900 rounded-lg border border-gray-800 inline-block text-left align-top">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Auth Status</h3>
                    <div className="flex flex-col gap-1 text-sm font-mono">
                        <div className="flex justify-between gap-8">
                            <span className="text-gray-400">Status:</span>
                            <span className={session ? "text-green-400" : "text-yellow-500"}>
                                {session ? "Logged In" : "Logged Out (Anonymous)"}
                            </span>
                        </div>
                        {session && (
                            <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-gray-800">
                                <span className="text-gray-500 text-xs">User ID:</span>
                                <span className="text-gray-300 text-xs break-all">{session.user.id}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12 text-gray-600 text-sm w-full max-w-2xl">
                <div className="mt-12 border-t border-gray-800 pt-8">
                    Testing Module: Comment Services (CRUD + Realtime)
                    <CommentDebugger />
                </div>
            </div>
        </div>
    )
};

export default TestingGround;
