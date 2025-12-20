import React, { useState } from 'react';
import { X, Music, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Props interface for UserItemsModal
 * title: Header text for the modal
 * items: Array of data to be displayed
 * onClose: Function to handle modal closure
 * onItemClick: Optional callback when an item is selected
 */
interface UserItemsModalProps {
    title: string;
    items: any[];
    onClose: () => void;
    onItemClick?: (item: any) => void;
}

const UserItemsModal: React.FC<UserItemsModalProps> = ({ title, items, onClose, onItemClick }) => {

    /**
     * Sub-component to handle logic for item covers
     * Priority: Image URL > Custom Color > Default Icon
     */
    const ThumbnailWrapper = ({ item }: { item: any }) => {
        const [imgError, setImgError] = useState(false);

        return (
            <div className="aspect-square bg-[#2a2a2a] rounded-xl overflow-hidden relative mb-3 shadow-lg border border-white/5 transition-all group-hover:border-[#FFD1D1]/30">
                {/* Render image if URL exists and has not failed loading */}
                {item.imageUrl && !imgError ? (
                    <img
                        src={item.imageUrl}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : item.color ? (
                    /* Fallback to custom playlist color if no image */
                    <div className="w-full h-full opacity-60" style={{ backgroundColor: item.color }} />
                ) : (
                    /* Final fallback to default music icon */
                    <div className="w-full h-full flex items-center justify-center text-white/5">
                        <Music size={32} />
                    </div>
                )}

                {/* Hover overlay with play button icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 bg-[#FFD1D1] rounded-full flex items-center justify-center text-black shadow-lg scale-90 group-hover:scale-100 transition-transform">
                        <Play fill="currentColor" size={20} />
                    </div>
                </div>

                {/* Star rating indicator shown if rating data is available */}
                {item.rating && (
                    <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-black text-[#FFD1D1] flex items-center gap-0.5 shadow-lg">
                        <Star size={8} fill="#EAB308" className="text-yellow-500 fill-yellow-500" />
                        {item.rating}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            {/* Backdrop with fade-in animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal container with scale-up and fade-in animation */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-5xl bg-[#1f1f1f] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] border border-white/5"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                        <X />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#121212]">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onItemClick?.(item)}
                                className="group cursor-pointer"
                            >
                                {/* Thumbnail with image/color/icon logic */}
                                <ThumbnailWrapper item={item} />

                                {/* Item Metadata */}
                                <h3 className="text-white text-xs font-bold truncate group-hover:text-[#FFD1D1] transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest truncate mt-0.5">
                                    {item.artist || item.type}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserItemsModal;