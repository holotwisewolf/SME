import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const confirmButtonClass = confirmVariant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-[#1DB954] hover:bg-[#1ed760] text-black';

    return createPortal(
        <div
            className="fixed inset-0 z-[99998] flex items-center justify-center px-4"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-[#1f1f1f] rounded-xl shadow-2xl max-w-md w-full p-6 border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Icon */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${confirmVariant === 'danger' ? 'bg-red-500/20' : 'bg-[#1DB954]/20'}`}>
                        <AlertTriangle className={`w-6 h-6 ${confirmVariant === 'danger' ? 'text-red-500' : 'text-[#1DB954]'}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                </div>

                {/* Message */}
                <p className="text-gray-300 mb-6">{message}</p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
