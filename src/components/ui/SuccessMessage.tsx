import React, { useEffect, useState } from 'react';
import { useSuccess } from '../../context/SuccessContext';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage: React.FC = () => {
    const { success, hideSuccess } = useSuccess();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (success) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [success]);

    if (!success && !isVisible) return null;

    return (
        <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] transition-all duration-300 ease-in-out ${success ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
                }`}
        >
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1e1e1e] border border-green-500/20 rounded-lg shadow-2xl min-w-[300px] max-w-[90vw] backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />

                <p className="text-sm font-medium text-gray-200 flex-grow">{success}</p>

                <button
                    onClick={hideSuccess}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default SuccessMessage;
