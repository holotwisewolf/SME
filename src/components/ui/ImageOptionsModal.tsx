import React from 'react';
import { createPortal } from 'react-dom';
import { Upload, RotateCcw, X, Image } from 'lucide-react';

interface ImageOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: () => void;
    onReset: () => void;
    hasCustomImage: boolean;
}

const ImageOptionsModal: React.FC<ImageOptionsModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    onReset,
    hasCustomImage
}) => {
    if (!isOpen) return null;

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
                            <Image className="w-5 h-5 text-[#FFD1D1]" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Playlist Image</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Options */}
                <div className="p-5 space-y-3">
                    {/* Upload Option */}
                    <button
                        onClick={() => {
                            onUpload();
                            onClose();
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#FFD1D1]/30 hover:bg-white/10 transition-all group"
                    >
                        <div className="p-2 rounded-full bg-[#FFD1D1]/10 group-hover:bg-[#FFD1D1]/20 transition-colors">
                            <Upload className="w-5 h-5 text-[#FFD1D1]" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-medium">Upload Image</p>
                            <p className="text-gray-500 text-sm">Choose a custom image</p>
                        </div>
                    </button>

                    {/* Reset Option - Only show if there's a custom image */}
                    {hasCustomImage && (
                        <button
                            onClick={() => {
                                onReset();
                                onClose();
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
                        >
                            <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                                <RotateCcw className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Reset to Default</p>
                                <p className="text-gray-500 text-sm">Remove custom image</p>
                            </div>
                        </button>
                    )}
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

export default ImageOptionsModal;
