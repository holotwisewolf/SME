// For You Page - Personalized recommendations

import React from 'react';

const ForYou: React.FC = () => {
    return (
        <div className="h-full flex flex-col p-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#D1D1D1] tracking-tight">For You</h1>
                <p className="text-[#D1D1D1]/60 mt-2">AI-powered personalized recommendations</p>
            </div>

            {/* Coming Soon Message */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-[#FFD1D1]/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#FFD1D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#D1D1D1] mb-3">Coming Soon!</h2>
                    <p className="text-[#D1D1D1]/60 mb-6">
                        Get personalized music recommendations based on your listening history and preferences.
                    </p>
                    <div className="bg-[#292929] border border-[#D1D1D1]/10 rounded-lg p-4">
                        <p className="text-sm text-[#D1D1D1]/70">
                            This feature is currently under development. Check back soon!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForYou;
