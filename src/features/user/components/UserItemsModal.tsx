import React from 'react';
import { X, Music, Disc, List, Play, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface DisplayItem {
    id: string;
    name: string;
    artist?: string;
    imageUrl?: string;
    type: 'playlist' | 'track' | 'album';
    rating?: number;
    addedAt?: string;
}

interface UserItemsModalProps {
    title: string;
    items: DisplayItem[];
    onClose: () => void;
    onItemClick?: (item: any) => void;
}

const UserItemsModal: React.FC<UserItemsModalProps> = ({ title, items, onClose, onItemClick }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-5xl bg-[#1f1f1f] rounded-2xl shadow-2xl flex flex-col max-h-[80vh] border border-white/5">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#121212]">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {items.map((item) => (
                            <div key={item.id} onClick={() => onItemClick?.(item)} className="group cursor-pointer">
                                <div className="aspect-square bg-[#2a2a2a] rounded-lg overflow-hidden relative mb-3 shadow-lg">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><Music size={40}/></div>}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="w-10 h-10 bg-[#FFD1D1] rounded-full flex items-center justify-center text-black"><Play fill="currentColor" size={20}/></div>
                                    </div>
                                    {item.rating && <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-[#FFD1D1] flex items-center gap-1"><Star size={10} fill="currentColor"/>{item.rating}</div>}
                                </div>
                                <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                                <p className="text-gray-500 text-xs truncate">{item.artist || item.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserItemsModal;