import React from 'react';
import CommentDebugger from '../components/comment_debugger';

const TestingGround: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Dev Zone</h1>
                <p className="text-gray-400">Independent environment for testing backend services.</p>
            </div>

            <div className="mt-12 text-gray-600 text-sm">
                Testing Module: Comment Services (CRUD + Realtime)
                <CommentDebugger />
            </div>
        </div>
    );
};

export default TestingGround;
