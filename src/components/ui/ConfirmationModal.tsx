import React from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, Trash2, HeartOff, AlertCircle, X } from 'lucide-react';

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

// Get the appropriate icon based on the action
const getActionIcon = (title: string, variant: 'danger' | 'primary') => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('export') || lowerTitle.includes('spotify')) {
        return <Share2 className="w-5 h-5" />;
    }
    if (lowerTitle.includes('copy')) {
        return <Copy className="w-5 h-5" />;
    }
    if (lowerTitle.includes('delete')) {
        return <Trash2 className="w-5 h-5" />;
    }
    if (lowerTitle.includes('remove') || lowerTitle.includes('favourite')) {
        return <HeartOff className="w-5 h-5" />;
    }
    return <AlertCircle className="w-5 h-5" />;
};

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

    const isPrimary = confirmVariant === 'primary';
    const iconColor = isPrimary ? 'text-[#FFD1D1]' : 'text-red-500';
    const iconBg = isPrimary ? 'bg-[#FFD1D1]/10' : 'bg-red-500/10';

    const confirmButtonStyles = isPrimary
        ? 'bg-[#FFD1D1] hover:bg-[#FFD1D1]/90 text-black font-semibold'
        : 'bg-red-600 hover:bg-red-600/90 text-white font-semibold';

    return createPortal(
        <div
            className="fixed inset-0 z-[99998] flex items-center justify-center px-4"
            onClick={onCancel}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative bg-[#181818] rounded-xl shadow-xl max-w-md w-full border border-white/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with icon and close button */}
                <div className="flex items-center justify-between p-5 pb-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full ${iconBg}`}>
                            <span className={iconColor}>
                                {getActionIcon(title, confirmVariant)}
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Message */}
                <div className="px-5 py-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-5 pt-2 border-t border-white/5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 rounded-lg text-sm transition-all duration-200 ${confirmButtonStyles}`}
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
