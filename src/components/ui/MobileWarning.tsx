import React from 'react';

const MobileWarning = () => (
    <div className="md:hidden fixed inset-0 z-50 bg-black flex items-center justify-center p-8 text-center">
        <div>
            <h1 className="text-2xl font-bold text-white mb-4">Please use a Computer 💻</h1>
            <p className="text-gray-400">
                This application is optimized for desktop usage. The mobile experience is currently under construction!
            </p>
        </div>
    </div>
);

export default MobileWarning;
