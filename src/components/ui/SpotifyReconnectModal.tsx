import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, LogIn, X, Music2 } from 'lucide-react';

interface SpotifyReconnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReconnect: () => Promise<boolean>;
    onFullLogin: () => void;
}

const SpotifyReconnectModal: React.FC<SpotifyReconnectModalProps> = ({
    isOpen,
    onClose,
    onReconnect,
    onFullLogin
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    if (!isOpen) return null;

    const handleReconnect = async () => {
        setIsRefreshing(true);
        try {
            const success = await onReconnect();
            if (success) {
                onClose();
            } else {
                // Refresh failed, need full login
                onFullLogin();
                onClose();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            onFullLogin();
            onClose();
        } finally {
            setIsRefreshing(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[99998] flex items-center justify-center px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative bg-[#181818] rounded-xl shadow-xl max-w-sm w-full border border-white/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-[#FFD1D1]/10">
                            <Music2 className="w-5 h-5 text-[#FFD1D1]" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Spotify Session Expired</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Message */}
                <div className="px-5 py-4">
                    <p className="text-gray-400 text-sm">
                        Your Spotify connection has expired. Would you like to reconnect?
                    </p>
                </div>

                {/* Options */}
                <div className="p-5 pt-0 space-y-3">
                    {/* Quick Reconnect Option */}
                    <button
                        onClick={handleReconnect}
                        disabled={isRefreshing}
                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-[#FFD1D1]/10 border border-[#FFD1D1]/20 hover:border-[#FFD1D1]/40 hover:bg-[#FFD1D1]/20 transition-all group disabled:opacity-50"
                    >
                        <div className="p-2 rounded-full bg-[#FFD1D1]/20 group-hover:bg-[#FFD1D1]/30 transition-colors">
                            <RefreshCw className={`w-5 h-5 text-[#FFD1D1] ${isRefreshing ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-medium">{isRefreshing ? 'Reconnecting...' : 'Quick Reconnect'}</p>
                            <p className="text-gray-500 text-sm">Refresh your session</p>
                        </div>
                    </button>

                    {/* Full Sign In Option */}
                    <button
                        onClick={() => {
                            onFullLogin();
                            onClose();
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group"
                    >
                        <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                            <LogIn className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-medium">Sign In Again</p>
                            <p className="text-gray-500 text-sm">Full Spotify login</p>
                        </div>
                    </button>
                </div>

                {/* Cancel */}
                <div className="px-5 pb-5">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SpotifyReconnectModal;
