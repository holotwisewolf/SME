import React, { useState } from 'react';
import { Play, Star, Music } from 'lucide-react';

export const UniversalThumbnail = ({ item }: { item: any }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div className="aspect-square bg-black/30 rounded-2xl overflow-hidden relative mb-3 shadow-xl border border-white/5 group-hover:scale-105 transition-all duration-300">
            {item.imageUrl && !imgError ? (
                <img src={item.imageUrl} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : item.color ? (
                <div className="w-full h-full opacity-60" style={{ backgroundColor: item.color }} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10"><Music size={40} /></div>
            )}
            {item.rating && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-[#FFD1D1] flex items-center gap-1 shadow-lg z-10 border border-white/10">
                    <Star size={10} fill="#FFD1D1" className="text-[#FFD1D1]" />
                    {item.rating}
                </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Play fill="white" size={24} /></div>
        </div>
    );
};
